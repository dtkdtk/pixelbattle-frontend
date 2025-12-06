import type { ComponentChildren } from "preact";
import styles from "./index.module.css";

interface ProgressBarProps {
    value: number;
    maxValue?: number;
    widthPx?: number;
    children?: ComponentChildren;
}

export function ProgressBar(props: ProgressBarProps) {
    const width = (props.widthPx?.toString() ?? "100") + "px";
    const maxValue = props.maxValue ?? 100;
    const percentage = props.value / maxValue * 100;
        
    return (
        <div className={styles.progressBar} style={{ width: width }}>
            <div
                className={styles.progress}
                style={{ width: `${percentage}%` }}
            />
            {props.children}
        </div>
    );
}