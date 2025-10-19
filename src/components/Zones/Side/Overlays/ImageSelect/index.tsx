import { useRef, useState } from "preact/hooks";
import { Button } from "@components";
import { useUploadImage } from "../useUploadImage";
import styles from "./index.module.css";

export const ImageSelect = () => {
    const { uploadImage } = useUploadImage();
    const [isHovered, setIsHovered] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    function onDrop(event: DragEvent) {
        event.preventDefault();

        unhover(event);
        const files = event.dataTransfer?.files;

        if (files && files.length) {
            uploadImage(files[0]);
        }
    }

    function onInput(event: React.ChangeEvent<HTMLInputElement>) {
        event.preventDefault();

        const files = event.currentTarget.files;

        if (files && files.length) {
            uploadImage(files[0]);
        }
    }

    function hover(event: DragEvent) {
        event.preventDefault();

        setIsHovered(true);
    }

    function unhover(event: DragEvent) {
        event.preventDefault();

        setIsHovered(false);
    }

    return (
        <div
            class={[styles.wrapper, isHovered ? styles.wrapperActive : ""].join(
                " "
            )}
            onDrop={onDrop}
            onDragEnter={hover}
            onDragOver={hover}
            onDragLeave={unhover}
        >
            <p class={styles.label}>Перетащите изображение</p>

            <p class={styles.or}>или</p>

            <input
                type="file"
                accept="image/*"
                onInput={onInput}
                ref={fileInputRef}
                class={styles.input}
            />

            <Button onClick={() => fileInputRef.current?.click()}>
                Выберите файл
            </Button>
        </div>
    );
};
