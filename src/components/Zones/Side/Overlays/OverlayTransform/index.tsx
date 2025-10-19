import { useEffect, useState } from "preact/hooks";
import { Button, Icon, TextField } from "@components";
import { useInfoStore, useOverlayStore } from "@stores";
import { useUploadImage } from "../useUploadImage";
import styles from "./index.module.css";

export const OverlayTransform = () => {
    const overlays = useOverlayStore();

    const info = useInfoStore();

    const [prevActive, setPrevActive] = useState(false);
    const [nextActive, setNextActive] = useState(false);

    const { addImage } = useUploadImage();

    useEffect(() => {
        setPrevActive(overlays.current > 0);
        setNextActive(overlays.current + 1 < overlays.overlays.length);
    }, [overlays.current, overlays.overlays.length]);

    function changeCoords(type: "x" | "y", value: string) {
        const newPosition = overlays.overlays[overlays.current].position;

        newPosition[type] = parseInt(value);

        overlays.setPosition(newPosition);
    }

    function changeOpacity(opacity: string) {
        overlays.setOpacity(parseInt(opacity));
    }

    return (
        <div class={styles.wrapper}>
            <div class={styles.image}>
                <p class={styles.imageName}>
                    {overlays.overlays[overlays.current].imageName}
                </p>
                <Button onClick={addImage} type="primary">
                    <Icon icon="open-folder" />
                </Button>
            </div>
            <div class={styles.image}>
                <Button
                    onClick={overlays.prevImage}
                    type="primary"
                    disabled={!prevActive}
                    full={true}
                >
                    <Icon icon="left" />
                </Button>

                <Button onClick={addImage} type="primary" full={true}>
                    <Icon icon="plus" />
                </Button>
                <Button
                    onClick={overlays.removeImage}
                    type="danger"
                    full={true}
                >
                    <Icon icon="plus" className={styles.removeIcon} />
                </Button>

                <Button
                    onClick={overlays.nextImage}
                    type="primary"
                    disabled={!nextActive}
                    full={true}
                >
                    <Icon icon="left" className={styles.rightIcon} />
                </Button>
            </div>
            <div class={styles.groups}>
                <div class={styles.group}>
                    <p class={styles.groupTitle}>Координаты</p>
                    <div class={styles.coordinates}>
                        <TextField
                            max={info.info?.canvas.width}
                            type="number"
                            placeholder="X координата"
                            defaultValue={overlays.overlays[
                                overlays.current
                            ].position.x.toString()}
                            onInput={(input) => changeCoords("x", input)}
                        />
                        <TextField
                            max={info.info?.canvas.height}
                            type="number"
                            placeholder="Y координата"
                            defaultValue={overlays.overlays[
                                overlays.current
                            ].position.y.toString()}
                            onInput={(input) => changeCoords("y", input)}
                        />
                    </div>
                </div>
                <div class={styles.group}>
                    <p class={styles.groupTitle}>Прозрачность</p>
                    <TextField
                        min={0}
                        max={100}
                        type="number"
                        placeholder="Прозрачность"
                        defaultValue={overlays.overlays[
                            overlays.current
                        ].opacity.toString()}
                        onInput={changeOpacity}
                    />
                </div>
            </div>
        </div>
    );
};
