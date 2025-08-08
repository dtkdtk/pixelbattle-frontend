import createStore, { Listener } from 'unistore'
import { InfoDaemon } from './info'
import { PaletteDaemon } from './palette'
import { ProfileDaemon } from './profile'
import { TagsDaemon } from './tags'
import { GeneralState, GeneralStatus, WebSocketStatus } from './types'
import { OverlaysDaemon } from './overlays'
import RequestsDaemon from './requests'
import { CanvasStorage, Viewport } from '../storage'
import WebSocketDaemon from './websocket'
import { ErrorDaemon } from './error'
import { Vector } from '../util/vector'
import { config } from 'src/config'

export class GeneralDaemon {
  private static store = createStore<GeneralState>({
    status: GeneralStatus.CONNECTING
  })

  private static fetchCanvas() {
    RequestsDaemon.pixels().then(async (v) => {
      CanvasStorage.process(v).then(() => {
        Viewport.processCanvas(
          new Vector(CanvasStorage.width, CanvasStorage.height)
        )
      })
      GeneralDaemon.setState({
        status: GeneralStatus.CORRECT
      })
    })
  }

  /**
   * Fetches and starts all in game elements (like daemons, and other)
   */
  static run() {
    console.log(!config.withoutServerMode.enable)
    if (!config.withoutServerMode.enable) {
      WebSocketDaemon.connect()

      WebSocketDaemon.on((state) => {
        const generalStatus = GeneralDaemon.state.status
        if (generalStatus === GeneralStatus.INTERNAL_ERROR) return

        let status: GeneralStatus
        switch (state.status) {
          case WebSocketStatus.CONNECTING:
            status = GeneralStatus.CONNECTING
            break
          default:
            status = GeneralStatus.WEBSOCKET_ERROR
            break
        }

        GeneralDaemon.setState({
          status
        })
      })
    } else {
      GeneralDaemon.sync()
    }

    PaletteDaemon.load()
    OverlaysDaemon.loadOverlays()
    ProfileDaemon.load()
    TagsDaemon.fetch()
    RequestsDaemon.profile()

    ErrorDaemon.on((state) => {
      if (state.internalError)
        GeneralDaemon.setState({
          status: GeneralStatus.INTERNAL_ERROR
        })
    })
  }

  /**
   * Start sync for all in game elements, after reconnect
   */
  static sync() {
    InfoDaemon.fetch()
    GeneralDaemon.fetchCanvas()
    ProfileDaemon.fetch()
  }

  private static setState(state: Partial<GeneralState>) {
    GeneralDaemon.store.setState(
      state as Pick<GeneralState, keyof GeneralState>
    )
  }

  /**
   * General status of game. If state.ready and not state.error, <LoadScreen /> is hides
   */
  static get state(): GeneralState {
    return GeneralDaemon.store.getState()
  }

  /**
   * Subscribe to updates of this daemon
   * @param f Event listener
   */
  static on(f: Listener<GeneralState>) {
    GeneralDaemon.store.subscribe(f)
  }

  /**
   * Unsubscribe to updates of this daemon
   * @param f Event listener
   */
  static off(f: Listener<GeneralState>) {
    GeneralDaemon.store.unsubscribe(f)
  }
}
