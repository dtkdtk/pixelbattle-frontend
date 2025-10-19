import { useEffect } from "preact/hooks";
import { useProfileStore } from "@stores";

export function Logout() {
    const profile = useProfileStore();

    useEffect(() => {
        profile.logout();

        window.location.replace("/");
    }, []);

    return null;
}
