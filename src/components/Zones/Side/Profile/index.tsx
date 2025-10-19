import { useEffect } from "preact/hooks";
import { Button, Parameter, WindowBox } from "@components";
import { ProfileLoginBody } from "./LoginBody";
import { useProfileStore, useTagsStore, useModalStore } from "@stores";
import { UserRole } from "@interfaces";
import styles from "./index.module.css";

export const Profile = () => {
    const profile = useProfileStore();
    const tags = useTagsStore();
    const modal = useModalStore();

    useEffect(() => {
        profile.load();

        if (profile.isAuthenticated()) {
            profile.fetch().then(() => tags.select(profile.user?.tag ?? ""));
        }
    }, []);

    const params = {
        Имя: profile.user?.username,
        Айди: profile.user?._id,
        Тег: profile.user?.tag,
        Статус: profile.user?.banned
            ? `Забанен по причине "${profile.user?.banned.reason ?? "Не указано"}"`
            : null,
        Роль: {
            [UserRole.User]: null,
            [UserRole.RESERVED]: "Стример",
            [UserRole.Moderator]: "Модератор",
            [UserRole.Admin]: "Админ",
            [UserRole.Developer]: "Разработчик"
        }[profile.user?.role ?? UserRole.User]
    };

    return profile.isAuthenticated() ? (
        <WindowBox title="Профиль">
            <div class={styles.wrapper}>
                <div className={styles.params}>
                    {Object.entries(params).map(([label, value]) => {
                        if (!value) return null;

                        return <Parameter value={value} label={label} />;
                    })}
                </div>

                <Button href="/logout">Выйти</Button>
            </div>
        </WindowBox>
    ) : (
        <div class={styles.login}>
            <Button onClick={() => modal.open("Вход", <ProfileLoginBody />)}>
                Войти
            </Button>
        </div>
    );
};
