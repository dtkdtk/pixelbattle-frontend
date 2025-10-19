import { create } from "zustand";
import type { ComponentChildren } from "preact";

interface ModalState {
    title: string;
    children: ComponentChildren;
}

export interface ModalStore {
    modal: ModalState | null;

    open: (title: string, children: ComponentChildren) => void;
    close: () => void;
}

export const useModalStore = create<ModalStore>((set, get) => ({
    modal: null,
    open: (title: string, children: ComponentChildren) => {
        set({ modal: { title, children } });
    },
    close: () => {
        set({ modal: null });
    }
}));
