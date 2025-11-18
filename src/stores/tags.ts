import { create } from "zustand";
import type { FormatedTag } from "@interfaces";
import { AppFetch } from "@classes";
import { useProfileStore } from "./profile";

export interface TagsState {
    tags: FormatedTag[];
    selectedTag: string;

    fetch: () => Promise<void>;
    pushFakeTag: (id: string, name: string) => void;
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

        const tags = response.tags.map(({ id, name, count }, index) => ({
            id,
            name,
            count,
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
            //get().pushFakeTag(profileStore.user.tag ?? "???");
        }
    },
    pushFakeTag: (id: string, name: string) => {
        const { tags } = get();
        set({
            tags: [
                ...tags,
                {
                    id,
                    name,
                    count: -1,
                    place: tags.length
                }
            ]
        });
    },
    purgeFakeTags: () => {
        const { tags } = get();
        set({
            tags: tags.filter((tag) => tag.count !== -1)
        });
    },
    select: (name: string) => {
        const { selectedTag, tags, pushFakeTag, purgeFakeTags } = get();

        if (selectedTag === name) {
            return;
        }

        const isPreviousTagFake =
            tags.find((tag) => tag.name === selectedTag)?.count === -1;
        if (isPreviousTagFake) {
            purgeFakeTags();
        }

        const isCurrentTagReal = tags.find((tag) => tag.name === name);
        if (!isCurrentTagReal) {
            //pushFakeTag(name);
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
