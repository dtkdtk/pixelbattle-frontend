import { create } from "zustand";
import { AppFetch, AppImage, ImageFormat } from "@classes";
import { PlaceContainer } from "@place-internal";

export interface PlaceState {
    image: AppImage | null;
    container: PlaceContainer | null;
    isLoading: boolean;
    error: string | null;

    fetchImage: () => Promise<void>;
    setImage: (image: AppImage | null) => void;
    setContainer: (container: PlaceContainer | null) => void;
    clear: () => void;
}

export const usePlaceStore = create<PlaceState>((set, get) => ({
    image: null,
    container: null,
    isLoading: false,
    error: null,
    fetchImage: async () => {
        const { image } = get();
        if (image) return;

        set({ isLoading: true, error: null });

        try {
            const imageBlob = await AppFetch.pixels();
            const processedImage = await AppImage.create(
                imageBlob,
                ImageFormat.RGB
            );

            set({
                image: processedImage,
                isLoading: false
            });
        } catch (error) {
            console.error("Failed to fetch place image:", error);
            set({
                error: "Failed to load image",
                isLoading: false
            });
        }
    },
    setImage: (image) => set({ image }),
    setContainer: (container) => set({ container }),
    clear: () =>
        set({
            image: null,
            container: null,
            error: null
        })
}));
