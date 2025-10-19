import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { config } from "@config";

export interface SettingsState {
    snow: boolean;

    toggleSnow: () => void;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set, _get) => ({
            ...config.defaults.settings,
            toggleSnow: () => set((state) => ({ snow: !state.snow }))
        }),
        {
            name: "settings",
            storage: createJSONStorage(() => localStorage),
            version: 0
        }
    )
);
