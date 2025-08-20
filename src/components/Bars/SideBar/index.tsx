import { Notifications } from 'src/components/Notifications'
import { Profile } from './Profile'
import { Tags } from './Tags'
import { Overlays } from './Overlays'
import styles from './index.module.styl'
import { OverlaysPhoneHelper } from './Overlays/PhoneHelpers'

export function SideBar() {
  return (
    <div className={styles.sidebar}>
      <div className={styles.sidebar_container}>
        <Profile />
        <Tags />
        <Overlays />
      </div>

      <OverlaysPhoneHelper></OverlaysPhoneHelper>

      <Notifications />
    </div>
  )
}
