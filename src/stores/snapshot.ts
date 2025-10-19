import { create } from "zustand";
import { Point } from "pixi.js";
import { usePlaceStore } from "./place";
import { useNotificationsStore } from "./notifications";
import { ClientNotificationMap } from "@utils";

function convertRGBtoRGBA(DATA_RGB: Uint8ClampedArray, { x, y }: Point) {
    const DATA_RGBA = new Uint8ClampedArray(x * y * 4);
    for (let i = 0, j = 0; i < DATA_RGB.length; i += 3, j += 4) {
        DATA_RGBA[j] = DATA_RGB[i];
        DATA_RGBA[j + 1] = DATA_RGB[i + 1];
        DATA_RGBA[j + 2] = DATA_RGB[i + 2];
        DATA_RGBA[j + 3] = 255;
    }
    return DATA_RGBA;
}

export interface SnapshotStore {
    empty: boolean;
    enable: boolean;
    captureMode: boolean;
    startPoint: Point;
    offsetPoint: Point;
    size: Point;
    scale: number;

    stop: () => void;
    clear: () => void;
    toggle: () => void;
    onPointerClick: (startPoint: Point) => void;
    onPointerMove: (point: Point) => void;
    fullScreenshot: () => void;
    toClipboard: (scaleLimit?: number) => Promise<void>;
    toFile: (scaleLimit?: number) => Promise<void>;
}

export const useSnapshotStore = create<SnapshotStore>((set, get) => ({
    empty: true,
    enable: false,
    captureMode: false,
    startPoint: new Point(),
    offsetPoint: new Point(NaN, NaN),
    size: new Point(),
    scale: 4,
    stop: () => {
        const { clear } = get();
        clear();
        set({ enable: false });
    },
    clear: () => {
        set({
            startPoint: new Point(),
            offsetPoint: new Point(NaN, NaN),
            size: new Point(),
            empty: true,
            captureMode: false
        });
    },
    toggle: () => {
        const { enable, clear } = get();
        set({ enable: !enable });
        clear();
    },
    onPointerClick: (startPoint: Point) => {
        const state = get();

        if (state.captureMode) {
            set({
                enable: false,
                captureMode: false,
                empty: false
            });
            state.toClipboard();
            return;
        }

        state.clear();
        set({ startPoint, captureMode: true });
    },
    onPointerMove: (point: Point) => {
        const state = get();
        if (!state.enable || !state.captureMode) return;

        let width = -state.startPoint.x + point.x;
        let height = -state.startPoint.y + point.y;
        const offsetPoint = new Point(state.offsetPoint.x, state.offsetPoint.y);
        let changed = false;

        if (width < 0) {
            width = Math.abs(width);
            changed = true;
            offsetPoint.x = point.x;
        } else if (!Number.isNaN(offsetPoint.x)) {
            offsetPoint.x = NaN;
            changed = true;
        }

        if (height < 0) {
            height = Math.abs(height);
            changed = true;
            offsetPoint.y = point.y;
        } else if (!Number.isNaN(offsetPoint.y)) {
            offsetPoint.y = NaN;
            changed = true;
        }

        width += 1;
        height += 1;

        if (changed) set({ offsetPoint });

        const normalSize = new Point(width, height);
        set({ size: normalSize });
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
    toClipboard: async (scaleLimit = 10) => {
        const image = usePlaceStore.getState().image;
        const { startPoint, offsetPoint, size, scale } = get();
        const { addNotification } = useNotificationsStore.getState();

        if (!image) return;

        const pos = new Point(
            !Number.isNaN(offsetPoint.x) ? offsetPoint.x : startPoint.x,
            !Number.isNaN(offsetPoint.y) ? offsetPoint.y : startPoint.y
        );

        let currentScale = scale;
        if (currentScale > scaleLimit) currentScale = scaleLimit;
        if (currentScale < 1) currentScale = 1;

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d")!;

        const bitmap = await createImageBitmap(
            new ImageData(
                convertRGBtoRGBA(image.buffer, image.size),
                image.size.x
            )
        );

        canvas.width = size.x * currentScale;
        canvas.height = size.y * currentScale;

        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(
            bitmap,
            pos.x,
            pos.y,
            size.x,
            size.y,
            0,
            0,
            size.x * currentScale,
            size.y * currentScale
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
    toFile: async (scaleLimit = 10) => {
        const image = usePlaceStore.getState().image;
        const { startPoint, offsetPoint, size, scale } = get();

        if (!image) return;

        const pos = new Point(
            !Number.isNaN(offsetPoint.x) ? offsetPoint.x : startPoint.x,
            !Number.isNaN(offsetPoint.y) ? offsetPoint.y : startPoint.y
        );

        let currentScale = scale;
        if (currentScale > scaleLimit) currentScale = scaleLimit;
        if (currentScale < 1) currentScale = 1;

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d")!;

        const bitmap = await createImageBitmap(
            new ImageData(
                convertRGBtoRGBA(image.buffer, image.size),
                image.size.x
            )
        );

        canvas.width = size.x * currentScale;
        canvas.height = size.y * currentScale;

        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(
            bitmap,
            pos.x,
            pos.y,
            size.x,
            size.y,
            0,
            0,
            size.x * currentScale,
            size.y * currentScale
        );

        const dataURL = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = dataURL;
        link.download = `pixelbattle_snapshot_${
            !Number.isNaN(offsetPoint.x) ? offsetPoint.x : startPoint.x
        }_${
            !Number.isNaN(offsetPoint.y) ? offsetPoint.y : startPoint.y
        }_${size.x}_${size.y}.png`;
        link.click();
    }
}));
