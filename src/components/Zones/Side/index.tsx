import { Tags } from "./Tags";
import { Overlays } from "./Overlays";
import { Snapshot } from "./Snapshot";
import { Notifications } from "@components";
import styles from "./index.module.css";

export function SideBar() {
    return (
        <div className={styles.sidebar}>
            <div className={styles.sidebar_container}>
                <Tags />
                <Overlays />
                <Snapshot />
            </div>

            <Notifications />
        </div>
    );
}
