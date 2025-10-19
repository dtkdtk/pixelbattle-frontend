import { create } from "zustand";
import { useInfoStore } from "./info";
import { useProfileStore } from "./profile";
import { AppWebSocket } from "@classes";
import { config } from "@config";

export interface CooldownState {
    progress: number;
    reqId: number;
    startTime: number;

    hasCooldown: () => boolean;

    start: () => void;
    update: (time: number) => void;
}

export const useCooldownStore = create<CooldownState>((set, get) => ({
    progress: 0,
    reqId: 0,
    startTime: 0,
    hasCooldown() {
        return get().progress > 0;
    },
    start: () => {
        const startTime = performance.now() - AppWebSocket.rtt;
        set({ startTime });

        const reqId = requestAnimationFrame((time) => get().update(time));
        set({ reqId });
    },
    update: (time: number) => {
        const { startTime, reqId } = get();
        const currentTime = time - startTime;

        const { info } = useInfoStore.getState();
        const { isStaff } = useProfileStore.getState();

        if (info === null) {
            return;
        }

        console.log(info.cooldown);
        const cooldownDuration =
            AppWebSocket.rtt +
            (isStaff() ? config.cooldown.staff : info.cooldown);

        const progress = currentTime / cooldownDuration;

        if (progress >= 1) {
            set({ progress: 0 });
            cancelAnimationFrame(reqId);
            return;
        }

        set({ progress: progress * 100 });

        requestAnimationFrame((nextTime) => get().update(nextTime));
    }
}));
