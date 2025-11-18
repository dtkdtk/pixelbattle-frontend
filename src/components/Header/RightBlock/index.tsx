import { Icon, ProfileView } from "@components";
import { useModalStore, useProfileStore } from "@stores";
import { LoginBody } from "./LoginBody";
import { SettingsBody } from "./SettingsBody";
import styles from "./index.module.css";

export function RightBlock() {
    const profile = useProfileStore();
    const modal = useModalStore();

    return (
        <div className={styles.right_block}>
            {profile.isAuthenticated() ? (
                <button
                    onClick={() =>
                        modal.open(
                            "Профиль",
                            <ProfileView profile={profile.user!} />
                        )
                    }
                >
                    <div className={styles.username}>
                        {profile.user?.username}
                    </div>
                </button>
            ) : (
                <button
                    class={styles.login}
                    onClick={() => modal.open("Вход", <LoginBody />)}
                >
                    <Icon icon="box-arrow" className={styles.login} size={25} />
                </button>
            )}
            <button onClick={() => modal.open("Настройки", <SettingsBody />)}>
                <Icon icon="gear" className={styles.settings} size={25} />
            </button>
        </div>
    );
}
