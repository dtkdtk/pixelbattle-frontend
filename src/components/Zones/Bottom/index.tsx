import { Palette } from "./Pallete";
import { Cooldown } from "./Cooldown";
import { PixelInfo } from "./PixelInfo";
import styles from "./index.module.css";

export function BottomBar() {
    return (
        <div className={styles.wrapper}>
            <div className={styles.coordinates}>
                <PixelInfo />
            </div>

            <div className={styles.cooldown}>
                <Cooldown />
            </div>

            <div className={styles.palette}>
                <Palette />
            </div>
        </div>
    );
}
