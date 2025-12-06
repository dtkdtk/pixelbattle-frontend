import { useCooldownStore } from "@stores";
import { ProgressBar } from "@components";
import styles from "./index.module.css";

export function Cooldown() {
    const cooldown = useCooldownStore();

    if (!cooldown.hasCooldown()) return null;

    return (
        <div className={styles.wrapper}>
            <ProgressBar 
                value={cooldown.progress}
            >
                <p className={styles.label}>{cooldown.progress.toFixed(0)}%</p>
            </ProgressBar>
        </div>
    );
}
