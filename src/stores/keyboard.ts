import { create } from "zustand";
import { KeyboardPipe } from "@utils";

export interface KeyboardStore {
    pipe: KeyboardPipe;
    isListening: boolean;
    listeners: {
        keydown: ((event: KeyboardEvent) => void) | null;
        keyup: ((event: KeyboardEvent) => void) | null;
    };

    addEventListeners: () => void;
    removeEventListeners: () => void;
}

export const useKeyboardStore = create<KeyboardStore>((set, get) => ({
    pipe: new KeyboardPipe(),
    isListening: false,
    listeners: {
        keydown: null,
        keyup: null
    },
    addEventListeners: () => {
        const state = get();

        if (state.isListening) {
            console.warn("Keyboard listeners already added");
            return;
        }

        const handleKeyEvent = (event: KeyboardEvent) => {
            state.pipe.emit(event);
        };

        const listeners = {
            keydown: handleKeyEvent,
            keyup: handleKeyEvent
        };

        document.addEventListener("keydown", listeners.keydown);
        document.addEventListener("keyup", listeners.keyup);

        set({
            isListening: true,
            listeners
        });

        console.log("Keyboard listeners added");
    },

    removeEventListeners: () => {
        const { isListening, listeners } = get();

        if (!isListening) {
            console.warn("No keyboard listeners to remove");
            return;
        }

        if (listeners.keydown) {
            document.removeEventListener("keydown", listeners.keydown);
        }
        if (listeners.keyup) {
            document.removeEventListener("keyup", listeners.keyup);
        }

        set({
            isListening: false,
            listeners: { keydown: null, keyup: null }
        });

        console.log("Keyboard listeners removed");
    }
}));
