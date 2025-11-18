import { useState, useEffect } from "preact/hooks";
import { Button, Parameter } from "@components";
import { useProfileStore } from "@stores";
import { UserRole, type ProfileInfo } from "@interfaces";
import styles from "./index.module.css";

interface ProfileViewProps {
    profile: ProfileInfo | Promise<ProfileInfo | null>;
}

export function ProfileView({ profile }: ProfileViewProps) {
    const [resolvedProfile, setResolvedProfile] = useState<ProfileInfo | null>(
        profile instanceof Promise ? null : profile
    );
    const [loading, setLoading] = useState(profile instanceof Promise);

    useEffect(() => {
        if (profile instanceof Promise) {
            setLoading(true);
            profile
                .then((res) => {
                    setResolvedProfile(res);
                })
                .finally(() => setLoading(false));
        }
    }, [profile]);

    if (loading) {
        return <div className={styles.wrapper}>Загрузка...</div>;
    }

    if (!resolvedProfile) {
        return <div className={styles.wrapper}>Профиль не найден</div>;
    }

    const params = {
        Никнейм: resolvedProfile.username,
        ID: resolvedProfile.id,
        Тег: resolvedProfile.tag,
        Статус: resolvedProfile.banned
            ? `Забанен по причине "${resolvedProfile.banned.reason ?? "Не указано"}"`
            : null,
        Роль: {
            [UserRole.User]: null,
            [UserRole.RESERVED]: "Неизвестно",
            [UserRole.Moderator]: "Модератор",
            [UserRole.Admin]: "Админ",
            [UserRole.Developer]: "Разработчик"
        }[resolvedProfile.role]
    };

    return (
        <div className={styles.wrapper}>
            <div className={styles.params}>
                {Object.entries(params).map(([label, value]) =>
                    value ? (
                        <Parameter key={label} value={value} label={label} />
                    ) : null
                )}
            </div>

            {useProfileStore.getState().user?.id === resolvedProfile.id && (
                <Button href="/logout">Выйти</Button>
            )}
        </div>
    );
}
