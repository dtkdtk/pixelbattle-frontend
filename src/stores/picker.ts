import { create } from "zustand";

export interface PickerState {
    isEnabled: {
        color: boolean;
        profile: boolean;
    };
    toggle: (key: keyof PickerState["isEnabled"]) => void;
}

export const usePickerStore = create<PickerState>((set) => ({
    isEnabled: { color: false, profile: false },
    toggle: (key) =>
        set((state) => ({
            isEnabled: {
                ...state.isEnabled,
                [key]: !state.isEnabled[key]
            }
        }))
}));
