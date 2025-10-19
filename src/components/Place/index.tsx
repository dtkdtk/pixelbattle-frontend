import { useEffect, useRef } from "preact/hooks";
import { usePlaceStore } from "@stores";
import { PlaceApp } from "./internal/PlaceApp";
import styles from "./index.module.css";
import { useKeyboardStore } from "../../stores/keyboard";

export function Place() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const place = usePlaceStore();
    const keyboard = useKeyboardStore();

    function setup() {
        place
            .fetchImage()
            .then(() => PlaceApp.create(canvasRef, usePlaceStore.getState()));
        keyboard.addEventListeners();

        return () => {
            keyboard.removeEventListeners();
        };
    }

    useEffect(setup, []);

    return <canvas ref={canvasRef} className={styles.canvas}></canvas>;
}
