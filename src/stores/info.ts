import { create } from "zustand";
import { AppFetch } from "@classes";
import type { ApiInfo } from "@interfaces";

export interface InfoStore {
    info: ApiInfo | null;
    isLoading: boolean;
    error: string | null;

    fetchInfo: () => Promise<ApiInfo>;
    endGame: () => void;
    startGame: () => void;
    setInfo: (info: ApiInfo | null) => void;
    clear: () => void;
}

export const useInfoStore = create<InfoStore>((set, get) => ({
    info: null,
    isLoading: false,
    error: null,
    fetchInfo: async (): Promise<ApiInfo> => {
        const { info } = get();

        if (info && !get().isLoading) {
            return info;
        }

        set({ isLoading: true, error: null });

        try {
            const apiInfo = await AppFetch.info();
            const processedInfo = {
                ...apiInfo,
                cooldown: apiInfo.cooldown
            };

            set({
                info: processedInfo,
                isLoading: false
            });

            return processedInfo;
        } catch (error) {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : "Failed to fetch game info";
            set({
                error: errorMessage,
                isLoading: false
            });
            throw error;
        }
    },
    endGame: () => {
        const { info } = get();

        if (!info) return;

        set({
            info: {
                ...info,
                ended: true
            }
        });
    },
    startGame: () => {
        const { info } = get();

        if (!info) return;

        set({
            info: {
                ...info,
                ended: false
            }
        });
    },
    setInfo: (info: ApiInfo | null) => {
        set({ info });
    },
    clear: () => {
        set({
            info: null,
            error: null,
            isLoading: false
        });
    }
}));

if (typeof window !== "undefined") {
    const info = useInfoStore.getState();

    info.fetchInfo().catch(() => {});

    setInterval(() => {
        info.fetchInfo().catch((e) => console.error(e));
    }, 30000);
}
