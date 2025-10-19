import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Point } from "pixi.js";
import { AppImage } from "@classes";
import { AppOverlay } from "../classes/AppOverlay";

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

export interface StoredOverlay {
    imageName: string;
    position: Point;
    opacity: number;
    blob: string;
}

export enum OverlayViewMode {
    Single = 0,
    All,
    Nothing
}

export interface OverlayState {
    overlays: Array<AppOverlay>;
    current: number;
    viewMode: OverlayViewMode;

    isSet: () => boolean;

    addImage: (
        image: AppImage,
        imageName: string,
        position: Point
    ) => Promise<void>;
    removeImage: () => void;
    prevImage: () => void;
    nextImage: () => void;
    nextMode: () => void;
    setOpacity: (opacity: number) => void;
    setPosition: (position: Point) => void;
}

export const useOverlayStore = create<OverlayState>()(
    persist(
        (set, get) => ({
            overlays: [],
            current: -1,
            viewMode: 0,
            isSet: () => {
                return get().current !== -1;
            },
            addImage: async (
                image: AppImage,
                imageName: string,
                position: Point
            ) => {
                const state = get();
                const blob = await blobToString(image.blob!);
                set({
                    overlays: [
                        ...state.overlays,
                        new AppOverlay(image, imageName, position, blob)
                    ],
                    current: state.overlays.length
                });
            },
            removeImage: () => {
                const state = get();
                set({
                    overlays: [
                        ...state.overlays.filter((v, i, vo) => {
                            return i !== state.overlays.length - 1;
                        })
                    ],
                    current: state.overlays.length - 2
                });
            },
            prevImage: () => {
                const state = get();
                set({
                    current:
                        state.current > 0 ? state.current - 1 : state.current
                });
            },
            nextImage: () => {
                const state = get();
                set({
                    current:
                        state.current < state.overlays.length - 1
                            ? state.current + 1
                            : state.current
                });
            },
            nextMode: () => {
                const oldMode = get().viewMode;
                set({
                    viewMode:
                        oldMode + 1 === 3
                            ? 0
                            : ((oldMode + 1) as OverlayViewMode)
                });
            },
            setOpacity: (opacity: number) => {
                const state = get();
                state.overlays[state.current].opacity = opacity;
                set({ overlays: state.overlays });
            },
            setPosition: (position: Point) => {
                const state = get();
                state.overlays[state.current].position = position;
                set({ overlays: state.overlays });
            }
        }),
        {
            name: "overlays",
            storage: createJSONStorage(() => localStorage),
            version: 0,
            onRehydrateStorage: () => async (state) => {
                if (!state) return;

                if (state.overlays) {
                    for (const i in state.overlays) {
                        state.overlays[i] = await AppOverlay.fromJSON(
                            state.overlays[i]
                        );
                    }
                }

                state.current = state.current ?? -1;
                state.viewMode = state.viewMode ?? 0;
            }
        }
    )
);
