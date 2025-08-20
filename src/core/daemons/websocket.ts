import createStore, { Listener } from 'unistore'
import {
  WebSocketError,
  WebSocketErrorsType,
  WebSocketState,
  WebSocketStatus
} from './types'
import { config } from 'src/config'
import { CanvasStorage } from '../storage'
import Color from '../util/color'
import { GeneralDaemon } from './general'
import { Envelope } from '../proto/generated/js'
import { Vector } from '../util/vector'
import { objectsEqual } from 'src/hooks/util/useDaemon'
import { CooldownDaemon } from './cooldown'
import { NotificationDaemon } from './notifications'
import {
  ConnectionNotificationMap,
  ServerNotificationMap
} from '../constants/notifications'

export default class WebSocketDaemon {
  private static connection: WebSocket
  private static store = createStore<WebSocketState>({
    status: WebSocketStatus.CONNECTING,
    attempts: 0
  })
  private static interval: NodeJS.Timeout

  public static connect() {
    WebSocketDaemon.setState({
      status: WebSocketStatus.CONNECTING
    })
    this.createWebSocket()
    this.setupEventListeners()
    if (this.interval) clearInterval(this.interval)
    this.interval = setInterval(() => {
      if (WebSocketDaemon.state.status === WebSocketStatus.ACTIVE) {
        const time = Date.now()
        const id = this.getNextId()
        const data = Envelope.encode({
          id: id,
          timestamp: time,
          ping: {
            senderSendTime: time
          }
        })
        this.resp.set(id, time)
        this.connection.send(data.finish())
      }
    }, 5000)
  }

  private static nextId = 0

  private static getNextId() {
    WebSocketDaemon.nextId = (WebSocketDaemon.nextId + 1) & 0xffff
    return WebSocketDaemon.nextId
  }

  private static createWebSocket() {
    this.connection = new WebSocket(
      config.url.api.replace('http', 'ws') + '/socket?z=123123123123'
    )
  }

  private static setupEventListeners() {
    WebSocketDaemon.connection.onopen = this.onOpen.bind(this)
    WebSocketDaemon.connection.onmessage = this.onMessage.bind(this)
    WebSocketDaemon.connection.onclose = this.onClose.bind(this)
    WebSocketDaemon.connection.onerror = this.onError.bind(this)
    WebSocketDaemon.connection.binaryType = 'arraybuffer'
  }

  private static send(obj: ArrayBufferLike) {}

  public static async putPixel(coordinates: Vector, color: Color) {
    const data = Envelope.encode({
      id: this.getNextId(),
      timestamp: Date.now(),
      pixel: {
        id: coordinates.x + coordinates.y * CanvasStorage.width,
        color: color.color
      }
    })
    if (WebSocketDaemon.state.status === WebSocketStatus.ACTIVE) {
      WebSocketDaemon.connection.send(data.finish())
    }
  }

  private static resp: Map<number, number> = new Map()
  private static rttSamples: number[] = []
  public static get rtt() {
    return this.rttSamples[0] ?? -1
  }
  public static get jitter() {
    let jitter = 0
    if (this.rttSamples.length > 1) {
      let sum = 0
      for (let i = 1; i < this.rttSamples.length; i++) {
        sum += Math.abs(this.rttSamples[i] - this.rttSamples[i - 1])
      }
      jitter = sum / (this.rttSamples.length - 1)
    } else {
      jitter = 0
    }
    return jitter
  }

  private static async onMessage(event: MessageEvent) {
    const data = Envelope.decode(new Uint8Array(event.data))

    if (data.pong) {
      const rtt = Date.now() - Number(data.pong.senderSendTime!)
      let jitter
      this.rttSamples.push(rtt)
      if (this.rttSamples.length > 10) this.rttSamples.shift()
      if (this.rttSamples.length > 1) {
        let sum = 0
        for (let i = 1; i < this.rttSamples.length; i++) {
          sum += Math.abs(this.rttSamples[i] - this.rttSamples[i - 1])
        }
        jitter = sum / (this.rttSamples.length - 1)
      } else {
        jitter = 0
      }
      console.log(`RTT: ${rtt} ms, Jitter: ${jitter} ms`)
    }
    if (data.pixel) {
      CanvasStorage.putPixel(
        data.pixel.id ?? 0,
        new Color(data.pixel.color ?? 0)
      )
    }
    if (data.error) {
      if (ConnectionNotificationMap[data.error.code])
        NotificationDaemon.addNotification({
          ...ConnectionNotificationMap[data.error.code],
          type: 'error'
        })
    }
  }

  private static onOpen() {
    WebSocketDaemon.setState({
      status: WebSocketStatus.ACTIVE,
      error: undefined
    })
    GeneralDaemon.sync()
  }

  private static onError(_: Event) {
    WebSocketDaemon.setState({
      status: WebSocketStatus.CLOSED,
      error: WebSocketError.CONNECTION
    })
    WebSocketDaemon.reconnect()
  }

  private static onClose(event: CloseEvent) {
    switch (event.code) {
      case 1000:
        WebSocketDaemon.setState({ status: WebSocketStatus.CLOSED })
        return
      case 1001:
        WebSocketDaemon.setState({
          status: WebSocketStatus.CLOSED,
          error: WebSocketError.AWAY
        })
        return
      case 1006:
        WebSocketDaemon.setState({
          status: WebSocketStatus.CLOSED,
          error: WebSocketError.CONNECTION
        })
        WebSocketDaemon.reconnect()
        return
      case 1008:
        WebSocketDaemon.setState({
          status: WebSocketStatus.CLOSED,
          error: WebSocketError.PROTOCOL
        })
        return
      case 1011:
        WebSocketDaemon.setState({
          status: WebSocketStatus.CLOSED,
          error: WebSocketError.INTERNAL
        })
        return
      default:
        WebSocketDaemon.setState({
          status: WebSocketStatus.CLOSED,
          error: WebSocketError.CONNECTION
        })
    }
  }

  static get closed() {
    return (
      WebSocketDaemon.connection.readyState === WebSocket.CLOSED ||
      WebSocketDaemon.connection.readyState === WebSocket.CLOSING
    )
  }

  private static reconnect() {
    if (!WebSocketDaemon.closed) return
    if (WebSocketDaemon.state.attempts >= config.ws.reconnectAttempts) return
    setTimeout((() => this.connect()).bind(this), config.time.ws)
    WebSocketDaemon.state.attempts++
  }

  private static setState(state: Partial<WebSocketState>) {
    const prev = WebSocketDaemon.store.getState()
    const next = { ...prev, ...state }
    if (objectsEqual(prev, next)) return
    WebSocketDaemon.store.setState(
      state as Pick<WebSocketState, keyof WebSocketState>
    )
  }

  static get state(): WebSocketState {
    return WebSocketDaemon.store.getState()
  }

  static on(f: Listener<WebSocketState>) {
    WebSocketDaemon.store.subscribe(f)
  }

  static off(f: Listener<WebSocketState>) {
    WebSocketDaemon.store.unsubscribe(f)
  }
}
