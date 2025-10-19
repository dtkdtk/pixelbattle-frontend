import { create } from "zustand";
import {
    type WebSocketState,
    WebSocketStatus,
    WebSocketError
} from "@interfaces";

export interface WebsocketState extends WebSocketState {
    setError: (error: WebSocketError | null) => void;
    setStatus: (status: WebSocketStatus) => void;
    addAttempt: () => void;
    clearAttempts: () => void;
}

export const useWebsocketStore = create<WebsocketState>((set, get) => ({
    status: WebSocketStatus.CONNECTING,
    attempts: 0,
    error: null,

    setError: (error) => set({ error }),
    setStatus: (status) => set({ status }),
    addAttempt: () => set((state) => ({ attempts: state.attempts + 1 })),
    clearAttempts: () => set({ attempts: 0 })
}));
