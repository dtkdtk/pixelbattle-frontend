import createStore, { Listener } from 'unistore'
import { PixelInfo, PointerState } from './types'
import RequestsDaemon from './requests'
import { Vector } from '../util/vector'
import { config } from 'src/config'
import { objectsEqual } from 'src/hooks/util/useDaemon'
import Color from '../util/color'

export class PointerDaemon {
  private static store = createStore<PointerState>({
    coordinates: new Vector(),
    empty: true,
    info: null,
    visible: false
  })

  static setVisible(visible: boolean) {
    if (PointerDaemon.state.visible !== visible)
      PointerDaemon.setState({ visible })
  }

  private static oldState: PointerState | null
  private static timerId: NodeJS.Timeout | null

  static init() {
    const sub = (state: PointerState) => {
      if (
        PointerDaemon.oldState &&
        !objectsEqual(PointerDaemon.oldState.coordinates, state.coordinates)
      ) {
        if (PointerDaemon.timerId !== null) {
          clearTimeout(PointerDaemon.timerId)
        }
        PointerDaemon.timerId = setTimeout(() => {
          PointerDaemon.fetchPixel()
          PointerDaemon.timerId = null
        }, config.time.pixelInfo)
      }
      PointerDaemon.oldState = PointerDaemon.state
    }
    PointerDaemon.on(sub)
  }

  static fetchPixel() {
    const state = PointerDaemon.state
    if (!state.coordinates.x || !state.coordinates.y) return
    PointerDaemon.setState({ info: 'loading' })

    RequestsDaemon.getPixel(state.coordinates.x, state.coordinates.y)
      .then((info) => {
        PointerDaemon.setState({ info })
      })
      .catch((e) => console.error(e))
  }

  static setCoordinates(coordinates: Vector) {
    if (PointerDaemon.state.empty)
      PointerDaemon.setState({ coordinates, empty: false })
    else PointerDaemon.setState({ coordinates })
  }

  private static setState(state: Partial<PointerState>) {
    const prev = PointerDaemon.store.getState()
    const next = { ...prev, ...state }
    if (objectsEqual(prev, next)) return
    PointerDaemon.store.setState(next)
  }

  public static get state(): PointerState {
    return PointerDaemon.store.getState()
  }

  static on(f: Listener<PointerState>) {
    PointerDaemon.store.subscribe(f)
  }

  static off(f: Listener<PointerState>) {
    PointerDaemon.store.unsubscribe(f)
  }
}
