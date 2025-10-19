import styles from "./index.module.css";
import { BottomBar, SideBar, TitleBar } from "../Zones";

export function Workspace() {
    return (
        <div className={styles.workspace}>
            <TitleBar />
            <SideBar />
            <BottomBar />
        </div>
    );
}
