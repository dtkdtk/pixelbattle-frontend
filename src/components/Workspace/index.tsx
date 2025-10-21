import styles from "./index.module.css";
import { BottomBar, SideBar } from "../Zones";

export function Workspace() {
    return (
        <div className={styles.workspace}>
            <SideBar />
            <BottomBar />
        </div>
    );
}
