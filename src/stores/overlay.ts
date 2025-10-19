import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Point } from "pixi.js";
import { AppImage } from "@classes";
import { config } from "@config";

export async function blobToString(image: Blob): Promise<string> {
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
        reader.onloadend = () => {
            if (typeof reader.result === "string") {
                resolve(reader.result);
            } else reject();
        };
        reader.onerror = () => reject();
        reader.readAsDataURL(image);
    });
}

export async function stringToBlob(str: string): Promise<Blob> {
    const fetchResponse = await fetch(str);
    return fetchResponse.blob();
}

export interface OverlayState {
    image: AppImage | null;
    imageName: string | null;
    position: Point | null;
    opacity: number | null;

    isSet: () => boolean;

    setImage: (
        image: AppImage,
        imageName: string,
        position: Point
    ) => Promise<void>;
    unsetImage: () => void;
    setOpacity: (opacity: number) => void;
    setPosition: (position: Point) => void;
}

export const useOverlayStore = create<OverlayState>()(
    persist(
        (set, get) => ({
            image: null,
            imageName: null,
            position: null,
            opacity: null,
            isSet: () => {
                return get().image !== null;
            },
            setImage: async (
                image: AppImage,
                imageName: string,
                position: Point
            ) => {
                set({
                    image,
                    imageName,
                    position,
                    opacity: config.overlay.defaultOpacity
                });
            },
            unsetImage: () => {
                set({
                    image: null,
                    imageName: null,
                    position: null,
                    opacity: null
                });
            },
            setOpacity: (opacity: number) => {
                set({ opacity });
            },
            setPosition: (position: Point) => {
                set({ position });
            }
        }),
        {
            name: "overlay-storage",
            storage: createJSONStorage(() => localStorage),
            version: 0
        }
    )
);
