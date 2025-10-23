import { BottomBar, SideBar } from "../Zones";
import styles from "./index.module.css";

export function Workspace() {
    return (
        <div className={styles.workspace}>
            <SideBar />
            <BottomBar />
        </div>
    );
}
