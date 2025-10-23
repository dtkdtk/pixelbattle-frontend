import { create } from "zustand";
import { type ProfileInfo, UserRole } from "@interfaces";
import { AppFetch, AppCookie } from "@classes";

export interface ProfileState {
    user: ProfileInfo | null;
    profile: { token: string; id: string } | null;

    isAuthenticated: () => boolean;
    isBanned: () => boolean;
    isStaff: () => boolean;
    isModerator: () => boolean;

    load: () => void;
    fetch: () => Promise<void>;
    login: (token: string, id: string) => void;
    logout: () => void;
    updateUser: (user: Partial<ProfileInfo>) => void;
}

export const useProfileStore = create<ProfileState>()((set, get) => ({
    user: null,
    profile: null,
    isAuthenticated: () => {
        return !!get().profile;
    },
    isBanned: () => {
        return !!get().user?.banned || false;
    },
    isStaff: () => {
        const role = get().user?.role || UserRole.User;
        return role >= UserRole.Moderator;
    },
    isModerator: () => {
        const role = get().user?.role || UserRole.User;
        return role >= UserRole.Moderator;
    },
    load: () => {
        const token = AppCookie.get("token");
        const id = AppCookie.get("userid");

        if (token && id) {
            set({ profile: { token, id } });
        }
    },
    fetch: async () => {
        const { profile } = get();
        if (!profile) return;

        try {
            const userData = await AppFetch.profile();
            set({ user: userData });
        } catch (error) {
            console.error("Failed to fetch profile:", error);

            if (error instanceof Error && error.message.includes("401")) {
                get().logout();
            }
        }
    },
    login: (token: string, id: string) => {
        set({ profile: { token, id } });
        get().fetch();
    },
    logout: () => {
        set({ user: null, profile: null });
        AppCookie.clear();
    },
    updateUser: (userUpdates: Partial<ProfileInfo>) => {
        set((state) => ({
            user: state.user ? { ...state.user, ...userUpdates } : null
        }));
    }
}));

if (typeof window !== "undefined") {
    const profile = useProfileStore.getState();

    profile.load();

    if (profile.isAuthenticated()) {
        profile.fetch();
    }
}
