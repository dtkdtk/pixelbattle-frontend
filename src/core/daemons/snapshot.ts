import createStore, { Listener } from 'unistore'
import { SnapshotState } from './types'
import { Vector } from '../util/vector'
import { CanvasStorage } from '../storage'
import { NotificationDaemon } from './notifications'
import { ClientNotificationMap } from '../constants/notifications'

export class SnapshotDaemon {
  private static store = createStore<SnapshotState>({
    empty: true,
    enable: false,
    field: {
      position: new Vector(0, 0),
      size: new Vector(100, 100)
    },
    scale: 1
  })

  static stop() {}

  static clear() {}

  static toggle() {}

  static fullScreenshot() {}

  static check() {
    const pos = this.state.field.position
    const size = this.state.field.size
    if (pos.x >= 0 && pos.y >= 0) return false
    const x = pos.x + size.x
    const y = pos.y + size.y
    return x <= CanvasStorage.width && y <= CanvasStorage.height
  }

  static async toCanvas(): Promise<HTMLCanvasElement | null> {
    if (!this.check()) return null

    const pos = this.state.field.position
    const size = this.state.field.size
    const startX = pos.x
    const startY = pos.y
    const endX = pos.x + size.x
    const endY = pos.y + size.y
    const scale = this.state.scale

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D

    canvas.width = size.x
    canvas.height = size.y

    for (let x = startX; x < endX; x++) {
      for (let y = startY; y < endY; y++) {
        ctx.fillStyle = CanvasStorage.getPixel(x, y)!.toHex()
        ctx.fillRect(x, y, 1, 1)
      }
    }

    const bitmap = await createImageBitmap(canvas)

    canvas.width = size.x * this.state.scale
    canvas.height = size.y * this.state.scale

    ctx.drawImage(
      bitmap,
      pos.x,
      pos.y,
      size.x,
      size.y,
      0,
      0,
      size.x * scale,
      size.y * scale
    )

    return canvas
  }

  static toClipboard() {
    const canvas = this.toCanvas()
    canvas.then((canvas) => {
      if (canvas == null)
        return NotificationDaemon.addNotification({
          ...ClientNotificationMap.SnapshotFailed,
          type: 'error'
        })

      canvas.toBlob(async (blob) => {
        try {
          // @ts-ignore
          const clbEl = new ClipboardItem({ 'image/png': blob })
          await navigator.clipboard.write([clbEl])
          NotificationDaemon.addNotification({
            ...ClientNotificationMap.SnapshotSuccess,
            type: 'success'
          })
        } catch {
          NotificationDaemon.addNotification({
            ...ClientNotificationMap.SnapshotFailed,
            type: 'error'
          })
        }
      })
    })
  }

  static toFile() {
    const canvas = this.toCanvas()

    canvas.then((canvas) => {
      if (canvas == null)
        return NotificationDaemon.addNotification({
          ...ClientNotificationMap.SnapshotFailed,
          type: 'error'
        })

      const dataURL = canvas.toDataURL('image/png')
      const link = document.createElement('a')
      link.href = dataURL
      link.download = `pixelbattle_snapshot_${SnapshotDaemon.state.field.position.x}_${SnapshotDaemon.state.field.position.y}_${SnapshotDaemon.state.field.size.x}_${
        SnapshotDaemon.state.field.size.y
      }.png`
      link.click()
    })
  }

  static setPosition(position: Vector) {
    this.state.field.position = position
  }

  private static set state(state: Partial<SnapshotState>) {
    SnapshotDaemon.store.setState(
      state as Pick<SnapshotState, keyof SnapshotState>
    )
  }

  static get state(): SnapshotState {
    return SnapshotDaemon.store.getState()
  }

  /**
   * Subscribe to updates of this daemon
   * @param f Event listener
   */
  static on(f: Listener<SnapshotState>) {
    SnapshotDaemon.store.subscribe(f)
  }

  /**
   * Unsubscribe to updates of this daemon
   * @param f Event listener
   */
  static off(f: Listener<SnapshotState>) {
    SnapshotDaemon.store.unsubscribe(f)
  }
}
