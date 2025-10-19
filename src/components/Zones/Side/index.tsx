//import { Notifications } from "src/components/Notifications";
import { Profile } from "./Profile";
import { Tags } from "./Tags";
//import { Overlays } from "./Overlays";
//import { OverlaysPhoneHelper } from "./Overlays/PhoneHelpers";
import { Notifications } from "@components";
import styles from "./index.module.css";

export function SideBar() {
    return (
        <div className={styles.sidebar}>
            <div className={styles.sidebar_container}>
                <Profile />
                <Tags />
            </div>

            <Notifications />
        </div>
    );
}

/* 
        <div className={styles.sidebar}>
            <div className={styles.sidebar_container}>
                <Profile />
                <Tags />
                <Overlays />
            </div>


            <Notifications />
        </div>
        */
