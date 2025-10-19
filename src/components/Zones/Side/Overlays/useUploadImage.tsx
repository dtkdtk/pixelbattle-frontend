import { AppImage } from "@classes";
import { useNotificationsStore, useOverlayStore, usePlaceStore } from "@stores";
import { Point } from "pixi.js";
import { useEffect, useState } from "preact/hooks";

export const useUploadImage = () => {
    const [fileInput, setFileInput] = useState<HTMLInputElement>();

    const overlays = useOverlayStore();
    const notifications = useNotificationsStore();

    async function uploadImage(image: File) {
        const decodedImage = await AppImage.fromBlob(image);

        const place = usePlaceStore.getState().image!.size;

        const isBiggerThatCanvas =
            place.x < decodedImage.size.x || place.y < decodedImage.size.y;

        if (isBiggerThatCanvas) {
            notifications.addNotification({
                title: "Слишком большое изображение",
                message: "Размер изображения больше игрового поля",
                type: "error"
            });

            return;
        }

        overlays.addImage(decodedImage, image.name, new Point(0, 0));
    }

    useEffect(() => {
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = "image/*";
        fileInput.oninput = (event: Event) => {
            const files = (event.currentTarget! as HTMLInputElement).files;
            if (files && files.length) {
                uploadImage(files[0]);
            }
        };
        setFileInput(fileInput);
    }, []);

    function addImage() {
        fileInput?.click();
    }

    return { addImage, uploadImage };
};
