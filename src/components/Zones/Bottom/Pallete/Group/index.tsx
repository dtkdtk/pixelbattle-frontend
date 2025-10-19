import styles from "./index.module.css";
import type { ComponentChildren } from "preact";

interface PaletteGroupProps {
    children: ComponentChildren;
}

export function PaletteGroup({ children }: PaletteGroupProps) {
    return <div className={styles.group}>{children}</div>;
}
