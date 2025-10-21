import { create } from "zustand";
import { Point } from "pixi.js";
import { usePlaceStore } from "./place";
import { useNotificationsStore } from "./notifications";
import { ClientNotificationMap } from "@utils";

// function getOptimalScale(size: Point, maxViewSize = 500): number {
//     const { x: width, y: height } = size;
//     const scaleX = width > 0 ? maxViewSize / width : 1;
//     const scaleY = height > 0 ? maxViewSize / height : 1;
//     const scale = Math.min(scaleX, scaleY);
//     return scale > 1 ? scale : 1;
// }

export interface SnapshotStore {
    empty: boolean;
    enable: boolean;
    captureMode: boolean;
    position: Point;
    size: Point;
    scale: number;

    stop: () => void;
    clear: () => void;
    toggle: () => void;
    fullScreenshot: () => void;
    toClipboard: (scaleLimit?: number) => Promise<void>;
    toFile: (scaleLimit?: number) => Promise<void>;
}

export const useSnapshotStore = create<SnapshotStore>((set, get) => ({
    empty: true,
    enable: false,
    captureMode: false,
    position: new Point(),
    size: new Point(),
    scale: 5,
    stop: () => {
        const { clear } = get();
        clear();
        set({ enable: false });
    },
    clear: () => {
        set({
            position: new Point(),
            size: new Point(1, 1),
            empty: true,
            captureMode: false
        });
    },
    toggle: () => {
        const { enable, clear } = get();
        clear();

        if (!enable) {
            const size = usePlaceStore.getState().image!.size;
            console.log(size);
            set({ enable: true, position: new Point(0, 0), size });
        } else set({ enable: false });
    },
    fullScreenshot: () => {
        const image = usePlaceStore.getState().image;
        if (!image) return;

        const { stop, toClipboard } = get();
        stop();

        set({ size: new Point(image.size.x, image.size.y) });
        toClipboard();
        set({ empty: false });
    },
    toClipboard: async () => {
        const image = usePlaceStore.getState().image;
        const { position, size, scale } = get();
        const { addNotification } = useNotificationsStore.getState();

        if (!image) return;

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d")!;

        canvas.width = size.x * scale;
        canvas.height = size.y * scale;

        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(
            image.canvas,
            position.x,
            position.y,
            size.x,
            size.y,
            0,
            0,
            size.x * scale,
            size.y * scale
        );

        canvas.toBlob(async (blob) => {
            try {
                // @ts-ignore
                const clbEl = new ClipboardItem({ "image/png": blob });
                await navigator.clipboard.write([clbEl]);
                addNotification({
                    ...ClientNotificationMap.SnapshotSuccess,
                    type: "success"
                });
            } catch {
                addNotification({
                    ...ClientNotificationMap.SnapshotFailed,
                    type: "error"
                });
            }
        });
    },
    toFile: async () => {
        const image = usePlaceStore.getState().image;
        const { position, size, scale } = get();

        if (!image) return;

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d")!;

        canvas.width = size.x * scale;
        canvas.height = size.y * scale;

        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(
            image.canvas,
            position.x,
            position.y,
            size.x,
            size.y,
            0,
            0,
            size.x * scale,
            size.y * scale
        );

        const dataURL = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = dataURL;
        link.download = `pixelbattle_snapshot_${position.x}_${position.y}_${size.x}_${size.y}.png`;
        link.click();
    }
}));
