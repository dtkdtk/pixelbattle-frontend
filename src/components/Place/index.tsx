import { useEffect, useRef } from "preact/hooks";
import { usePlaceStore, useKeyboardStore } from "@stores";
import { PlaceApp } from "./internal";
import styles from "./index.module.css";

export function Place() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const isLoading = usePlaceStore((state) => state.isLoading);
    const keyboard = useKeyboardStore();

    useEffect(() => {
        if (isLoading) return;

        PlaceApp.create(canvasRef, usePlaceStore.getState());
        keyboard.addEventListeners();

        return () => {
            keyboard.removeEventListeners();
        };
    }, [isLoading]);

    return <canvas ref={canvasRef} className={styles.canvas}></canvas>;
}
