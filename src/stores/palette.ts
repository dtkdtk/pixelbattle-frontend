import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AppColor } from "@classes";
import { config } from "@config";

export interface PaletteState {
    colors: AppColor[];
    selected: AppColor;

    isDefaultColors: () => boolean;
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
            isDefaultColors() {
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
            storage: {
                getItem: (name) => {
                    const str = localStorage.getItem(name);
                    if (!str) return null;

                    const parsed = JSON.parse(str);

                    return {
                        ...parsed,
                        state: {
                            ...parsed.state,
                            selected: new AppColor(parsed.state.selected),
                            colors: parsed.state.colors.map(
                                (hex: string) => new AppColor(hex)
                            )
                        }
                    };
                },
                setItem: (name, value) => {
                    const state = {
                        ...value,
                        state: {
                            ...value.state,
                            selected: value.state.selected.toHex(),
                            colors: value.state.colors.map((color) =>
                                color.toHex()
                            )
                        }
                    };

                    localStorage.setItem(name, JSON.stringify(state));
                },
                removeItem: (name) => localStorage.removeItem(name)
            },
            //storage: createJSONStorage(() => localStorage),
            version: 0
        }
    )
);
