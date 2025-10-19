import { create } from "zustand";

export interface PickerState {
    isEnabled: boolean;
    toggle: () => void;
}

export const usePickerStore = create<PickerState>((set) => ({
    isEnabled: false,
    toggle: () => set((state) => ({ isEnabled: !state.isEnabled }))
}));
