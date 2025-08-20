import { config } from 'src/config'
import { CooldownDaemon } from '../daemons/cooldown'
import { InfoDaemon } from '../daemons/info'
import { PaletteDaemon } from '../daemons/palette'
import { ProfileDaemon } from '../daemons/profile'
import { CanvasStorage, Viewport } from '../storage'
import WebSocketDaemon from '../daemons/websocket'
import { Vector } from '../util/vector'
import { NotificationDaemon } from '../daemons/notifications'
import { NotificationType } from '../daemons/types'
import { ClientNotificationMap } from '../constants/notifications'

export class ApiPlace {
  public static putPixel(x: number, y: number) {
    if (CooldownDaemon.state.hasCooldown) {
      NotificationDaemon.addNotification({
        ...ClientNotificationMap.Cooldown,
        type: 'error'
      })
      return
    }
    if (CooldownDaemon.state === null) {
      return
    }
    const info = InfoDaemon.state
    if (info === null || info.ended) {
      return
    }

    if (!ProfileDaemon.state.isAuthenticated) {
      NotificationDaemon.addNotification({
        ...ClientNotificationMap['Not logged'],
        type: 'error'
      })
      return
    }
    if (ProfileDaemon.state.isBanned) {
      return
    }
    if (!Viewport.checkPointInside(x, y)) return

    CooldownDaemon.preStart()

    WebSocketDaemon.putPixel(new Vector(x, y), PaletteDaemon.state.selected)
    // .then(() => CooldownDaemon.start())
    // .catch(() => CooldownDaemon.stop())
    CooldownDaemon.start()

    // if (config.withoutServerMode.enable) {
    //   CanvasStorage.putPixel(x, y, PaletteDaemon.state.selected)
    // }
  }
}
