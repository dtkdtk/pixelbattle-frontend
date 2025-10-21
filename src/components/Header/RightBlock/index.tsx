import { useEffect } from "preact/hooks";
import { Icon } from "@components";
import { useProfileStore } from "@stores";
import styles from "./index.module.css";

export function RightBlock() {
    const profile = useProfileStore();

    useEffect(() => {
        profile.load();

        if (profile.isAuthenticated()) {
            profile.fetch();
        }
    }, []);

    return (
        <div className={styles.right_block}>
            <div>{profile.user?.username}</div>
            <button>
                <Icon icon="gear" className={styles.icon} />
            </button>
        </div>
    );
}
