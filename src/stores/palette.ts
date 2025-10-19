import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { config } from "@config";
import { AppColor } from "@classes";

export interface PaletteState {
    colors: AppColor[];
    selected: AppColor;

    isDefaultColors: boolean;
    isDefaultColor: (color: AppColor) => boolean;

    setCurrentColor: (color: AppColor) => void;
    addColor: (color: AppColor) => void;
    addAndSelect: (color: AppColor) => void;
    removeColor: (color: AppColor) => void;
    reset: () => void;
}

export const usePaletteStore = create<PaletteState>()(
    persist(
        (set, get) => ({
            colors: config.defaults.colors.palette.colors,
            selected: config.defaults.colors.palette.selected,
            get isDefaultColors() {
                return (
                    get().colors.length ===
                    config.defaults.colors.palette.colors.length
                );
            },
            isDefaultColor: (color: AppColor) => {
                return config.defaults.colors.palette.colors.some((c) =>
                    c.equals(color)
                );
            },
            setCurrentColor: (color: AppColor) => {
                set({ selected: color });
            },
            addColor: (color: AppColor) => {
                set((state) => ({
                    colors: [...state.colors, color]
                }));
            },
            addAndSelect: (color: AppColor) => {
                const state = get();
                const isColorInPalette = state.colors.some((c) =>
                    c.equals(color)
                );

                if (!isColorInPalette) {
                    set({
                        colors: [...state.colors, color],
                        selected: color
                    });
                } else {
                    set({ selected: color });
                }
            },
            removeColor: (color: AppColor) => {
                set((state) => {
                    const filteredColors = state.colors.filter(
                        (c) => !c.equals(color)
                    );
                    const newSelected = filteredColors.at(-2) || state.selected;

                    return {
                        colors: filteredColors,
                        selected: newSelected
                    };
                });
            },
            reset: () => {
                set({
                    colors: config.defaults.colors.palette.colors,
                    selected: config.defaults.colors.palette.selected
                });
            }
        }),
        {
            name: "palette",
            storage: createJSONStorage(() => localStorage),
            version: 0
        }
    )
);
