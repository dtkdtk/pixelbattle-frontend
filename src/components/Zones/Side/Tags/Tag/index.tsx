import type { FormatedTag } from "@interfaces";
import { useProfileStore, useTagsStore, useNotificationsStore } from "@stores";
import styles from "./index.module.css";

interface TagProps {
    tag: FormatedTag;
}

export function Tag({ tag }: TagProps) {
    const tags = useTagsStore();
    const profile = useProfileStore();
    const className = [
        styles.tag,
        tag.name === tags.selectedTag ? styles.selected : ""
    ].join(" ");

    function onClick() {
        if (!profile.isAuthenticated) {
            return;
        }

        tags.selectAndFetch(tag.name);
        useNotificationsStore.getState().addNotification({
            type: "success",
            title: "Изменение тега",
            message: `Ваш новый тег: ${tag.name}`
        });
    }

    return (
        <button className={className} onClick={onClick}>
            <p className={styles.place}>{tag.place + 1}</p>
            <p className={styles.name}>{tag.name ?? "[Тег удалён]"}</p>
            <p className={styles.score}>
                {tag.count === -1 ? "??" : tag.count}
            </p>
        </button>
    );
}
