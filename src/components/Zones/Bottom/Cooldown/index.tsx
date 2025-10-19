import { useCooldownStore } from "@stores";
import styles from "./index.module.css";

export function Cooldown() {
    const cooldown = useCooldownStore();

    if (!cooldown.hasCooldown()) return null;

    return (
        <div className={styles.wrapper}>
            <progress
                className={styles.progress}
                value={cooldown.progress}
                max="100"
            ></progress>
            <p className={styles.label}>{cooldown.progress.toFixed(0)}%</p>
        </div>
    );
}
