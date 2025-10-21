import { useSnapshotStore } from "@stores";
import { WindowBox, Button, TextField } from "../../../General";
import styles from "./index.module.css";
import type { Point } from "pixi.js";
import { useMemo } from "preact/hooks";

export const Snapshot = () => {
    const snapshot = useSnapshotStore();

    // function getMaxSizeForPNG(
    //     size: { x: number; y: number },
    //     maxBytes = 50 * 1024 * 1024
    // ): number {
    //     const bytesPerPixel = 4;
    //     const currentBytes = size.x * size.y * bytesPerPixel;

    //     if (currentBytes <= maxBytes) {
    //         return Math.max(size.x, size.y);
    //     }

    //     const scale = Math.sqrt(maxBytes / currentBytes);

    //     const maxWidth = Math.floor(size.x * scale);
    //     const maxHeight = Math.floor(size.y * scale);

    //     return Math.max(maxWidth, maxHeight);
    // }

    function getSafeScale(
        sourceSize: Point,
        maxBytes = 128 * 1024 * 1024
    ): number {
        const { x: w, y: h } = sourceSize;

        const baseBytes = w * h * 4;

        if (baseBytes === 0) return 0;

        const maxScale = Math.sqrt(maxBytes / baseBytes);
        return Math.floor(maxScale * 100) / 100;
    }

    const safeScale = useMemo(() => {
        const v = getSafeScale(snapshot.size);
        if (v === 0) return 100;
        return v;
    }, [snapshot.size]);

    return (
        <WindowBox title="Снимок холста">
            <div className={styles.wrapper}>
                <Button onClick={() => void snapshot.toggle()}>
                    {snapshot.enable ? "Выключить" : "Включить"}
                </Button>
                <p class={styles.or}>или</p>
                <Button onClick={() => void snapshot.fullScreenshot()}>
                    Всего холста
                </Button>

                {snapshot.empty ? (
                    <></>
                ) : (
                    <>
                        <p class={styles.groupTitle + styles.label}>Действия</p>
                        <Button onClick={() => void snapshot.toFile()}>
                            Сохранить
                        </Button>
                        <Button onClick={() => void snapshot.toClipboard()}>
                            В буфер обмена
                        </Button>
                    </>
                )}

                <p class={styles.label}>Множитель масштаба</p>
                <TextField
                    placeholder="Кратно"
                    onInput={(ivo: string) => {
                        if (!isNaN(ivo as any)) {
                            const v = Number(ivo);
                            const safe = Math.floor(
                                getSafeScale(snapshot.size)
                            );
                            snapshot.scale = v > safe ? safe : v;
                            console.log(v, snapshot.scale, safe);
                        }
                    }}
                    type="number"
                    min={1}
                    max={safeScale}
                    value={snapshot.scale + ""}
                ></TextField>
            </div>
        </WindowBox>
    );
};
