import { useSnapshotStore } from "@stores";
import { WindowBox, Button, TextField } from "../../../General";
import styles from "./index.module.css";

export const Snapshot = () => {
    const snapshot = useSnapshotStore();

    function getMaxSizeForPNG(
        size: { x: number; y: number },
        maxBytes = 50 * 1024 * 1024
    ): number {
        const bytesPerPixel = 4;
        const currentBytes = size.x * size.y * bytesPerPixel;

        if (currentBytes <= maxBytes) {
            return Math.max(size.x, size.y);
        }

        const scale = Math.sqrt(maxBytes / currentBytes);

        const maxWidth = Math.floor(size.x * scale);
        const maxHeight = Math.floor(size.y * scale);

        return Math.max(maxWidth, maxHeight);
    }

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

                <p class={styles.label}>Размер выходного скриншота</p>
                <TextField
                    placeholder="Увеличит масштаб"
                    onInput={(ivo: string) => {
                        if (!isNaN(ivo as any)) {
                            const v = Number(ivo);
                            const safe = getMaxSizeForPNG(snapshot.size);
                            if (v <= safe) snapshot.desiredSize = v;
                            else snapshot.desiredSize = safe;
                        }
                    }}
                    type="number"
                    min={1}
                    max={getMaxSizeForPNG(snapshot.size)}
                    value={snapshot.desiredSize + ""}
                ></TextField>
            </div>
        </WindowBox>
    );
};
