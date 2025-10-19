import { create } from "zustand";
import type { FormatedTag } from "@interfaces";
import { AppFetch } from "@classes";
import { useProfileStore } from "./profile";

export interface TagsState {
    tags: FormatedTag[];
    selectedTag: string;

    fetch: () => Promise<void>;
    pushFakeTag: (name: string) => void;
    purgeFakeTags: () => void;
    select: (name: string) => void;
    selectAndFetch: (name: string) => void;
    remove: () => void;
}

export const useTagsStore = create<TagsState>((set, get) => ({
    tags: [],
    selectedTag: "",
    fetch: async () => {
        const response = await AppFetch.tags();

        const tags = response.tags.map((tag, index) => ({
            name: tag[0],
            pixels: tag[1],
            place: index
        }));

        set({ tags });

        const profileStore = useProfileStore.getState();

        if (!profileStore.isAuthenticated || profileStore.user === null) {
            return;
        }

        const hasUserSelectedTag = profileStore.user.tag !== null;
        if (!hasUserSelectedTag) {
            return;
        }

        const selectedTag = profileStore.user.tag ?? "";
        set({ selectedTag });

        const isUserSelectedTagFake = !tags.some(
            (tag) => tag.name === selectedTag
        );
        if (isUserSelectedTagFake) {
            get().pushFakeTag(profileStore.user.tag ?? "???");
        }
    },
    pushFakeTag: (name: string) => {
        const { tags } = get();
        set({
            tags: [
                ...tags,
                {
                    name,
                    pixels: -1,
                    place: tags.length
                }
            ]
        });
    },
    purgeFakeTags: () => {
        const { tags } = get();
        set({
            tags: tags.filter((tag) => tag.pixels !== -1)
        });
    },
    select: (name: string) => {
        const { selectedTag, tags, pushFakeTag, purgeFakeTags } = get();

        if (selectedTag === name) {
            return;
        }

        const isPreviousTagFake =
            tags.find((tag) => tag.name === selectedTag)?.pixels === -1;
        if (isPreviousTagFake) {
            purgeFakeTags();
        }

        const isCurrentTagReal = tags.find((tag) => tag.name === name);
        if (!isCurrentTagReal) {
            pushFakeTag(name);
        }

        set({ selectedTag: name });
    },
    selectAndFetch: (name: string) => {
        const { select } = get();
        select(name);
        AppFetch.changeTag(name).then(() => useProfileStore.getState().fetch());
    },
    remove: () => {
        const { purgeFakeTags } = get();
        set({ selectedTag: "" });
        purgeFakeTags();
        AppFetch.changeTag("").then(() => useProfileStore.getState().fetch());
    }
}));
