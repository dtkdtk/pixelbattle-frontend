import { Point } from "pixi.js";
import styles from "./index.module.css";

export function Coordinates({
    coordinates,
    empty
}: {
    coordinates: Point;
    empty: boolean;
}) {
    if (empty) {
        // Fixes jumping when sidebar in scroll mode
        return (
            <p className={[styles.coordinates, styles.empty].join(" ")}>
                Пусто
            </p>
        );
    }

    return (
        <p
            className={styles.coordinates}
            style={{
                opacity: 1
            }}
        >
            {coordinates.x + ", " + coordinates.y}
        </p>
    );
}
