import { create } from "zustand";
import { Point } from "pixi.js";
import type { PixelInfo } from "@interfaces";
import { AppFetch } from "@classes";

export interface CoordinatesState {
    coordinates: Point;
    info: PixelInfo | "loading" | null;

    setCoordinates: (point: Point) => void;
    removeCoordinates: () => void;
    fetchInfo: () => Promise<void>;
}

export const useCoordinatesStore = create<CoordinatesState>((set, get) => ({
    coordinates: new Point(-1, -1),
    info: null,
    setCoordinates: (point: Point) => {
        set({ coordinates: point });
    },
    removeCoordinates: () => {
        set({ coordinates: new Point(-1, -1), info: null });
    },
    fetchInfo: async () => {
        const { coordinates } = get();

        if (coordinates.x === -1) return;

        set({ info: "loading" });

        try {
            const pixelInfo = await AppFetch.getPixel(coordinates);
            set({ info: pixelInfo });
        } catch (error) {
            console.error("Failed to fetch pixel info:", error);
            set({ info: null });
        }
    }
}));
