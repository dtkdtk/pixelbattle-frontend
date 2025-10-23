import { Button, Parameter } from "@components";
import { useProfileStore } from "@stores";
import { UserRole } from "@interfaces";
import styles from "./index.module.css";

export function ProfileBody() {
    const profile = useProfileStore();

    const params = {
        Никнейм: profile.user!.username,
        ID: profile.user!._id,
        Тег: profile.user!.tag,
        Статус: profile.user!.banned
            ? `Забанен по причине "${profile.user!.banned.reason ?? "Не указано"}"`
            : null,
        Роль: {
            [UserRole.User]: null,
            [UserRole.RESERVED]: "Неизвестно",
            [UserRole.Moderator]: "Модератор",
            [UserRole.Admin]: "Админ",
            [UserRole.Developer]: "Разработчик"
        }[profile.user!.role]
    };

    return (
        <div class={styles.wrapper}>
            <div className={styles.params}>
                {Object.entries(params).map(([label, value]) => {
                    if (!value) return null;

                    return <Parameter value={value} label={label} />;
                })}
            </div>

            <Button href="/logout">Выйти</Button>
        </div>
    );
}
