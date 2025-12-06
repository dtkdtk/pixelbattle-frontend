import { useEffect, useRef, useState } from "preact/hooks";
import { Icon } from "@components";
import { usePaletteStore } from "@stores";
import styles from "./index.module.css";

export const ColorDelete = () => {
    const palette = usePaletteStore();
    const [shift, setShift] = useState<boolean>(false);
    const touchTimerRef = useRef<NodeJS.Timeout>();
    const [disabled, setDisabled] = useState<boolean>(true);

    function onKeyEvent(event: KeyboardEvent) {
        setShift(event.shiftKey);
    }

    function onClickStart(event: MouseEvent | TouchEvent) {
        event.preventDefault();
        if (touchTimerRef.current) clearTimeout(touchTimerRef.current);
        if (!palette.isDefaultColors()) {
            touchTimerRef.current = setTimeout(() => {
                palette.reset();
            }, 500);
            setDisabled(false);
        }
    }

    function onClickEnd(event: MouseEvent | TouchEvent) {
        event.preventDefault();
        if (touchTimerRef.current) clearTimeout(touchTimerRef.current);
        if (event.shiftKey) {
            palette.reset();
            return;
        }
        if (!palette.isDefaultColor(palette.selected)) {
            palette.removeColor(palette.selected);
        }
        setDisabled(true);
    }

    function onClickCancel(event: MouseEvent | TouchEvent) {
        event.preventDefault();
        if (touchTimerRef.current) clearTimeout(touchTimerRef.current);
        setDisabled(true);
    }

    useEffect(() => {
        document.addEventListener("keydown", onKeyEvent);
        document.addEventListener("keyup", onKeyEvent);

        return () => {
            document.removeEventListener("keydown", onKeyEvent);
            document.removeEventListener("keyup", onKeyEvent);
        };
    }, []);

    return (
        <button
            className={[
                styles.button,
                !disabled || shift || !palette.isDefaultColor(palette.selected)
                    ? ""
                    : styles.buttonDisabled
            ].join(" ")}
            title="Удалить выбранный цвет"
            onMouseDown={onClickStart}
            onMouseUp={onClickEnd}
            onTouchStart={onClickStart}
            onTouchEnd={onClickEnd}
            onTouchCancel={onClickCancel}
        >
            <Icon icon="plus" className={styles.icon} />
        </button>
    );
};
