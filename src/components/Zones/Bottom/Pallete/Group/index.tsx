import styles from "./index.module.css";
import type { ComponentChildren } from "preact";

interface PaletteGroupProps {
    children: ComponentChildren;
    scrollable?: boolean;
}

export function PaletteGroup({ children, scrollable }: PaletteGroupProps) {
    return (
        <div
            className={
                scrollable
                    ? `${styles.group} ${styles.scrollable}`
                    : styles.group
            }
        >
            {children}
        </div>
    );
}
