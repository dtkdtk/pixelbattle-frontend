import { OverlayViewMode, useOverlayStore } from "@stores";
import { Button, WindowBox } from "../../../General";
import { ImageSelect } from "./ImageSelect";
import { OverlayTransform } from "./OverlayTransform";
import styles from "./index.module.css";

export const Overlays = () => {
    const overlays = useOverlayStore();
    return (
        <WindowBox title="Изображения">
            {overlays.current !== -1 ? (
                <>
                    <OverlayTransform />
                    <div className={styles.group}>
                        <Button onClick={overlays.nextMode}>
                            {overlays.viewMode === OverlayViewMode.Single
                                ? "Режим одного изображения"
                                : overlays.viewMode === OverlayViewMode.All
                                  ? "Режим всех изображений"
                                  : "Изображения скрыты"}
                        </Button>
                    </div>
                </>
            ) : (
                <ImageSelect />
            )}
        </WindowBox>
    );
};
