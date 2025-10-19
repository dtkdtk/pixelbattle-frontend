import { useEffect, useRef, useState } from "preact/hooks";
import { Tag } from "./Tag";
import { OpenedTagCreate } from "./OpenedTagCreate";
import { ClosedTagCreate } from "./ClosedTagCreate";
import { WindowBox } from "@components";
import { useProfileStore, useTagsStore } from "@stores";
import { config } from "@config";
import styles from "./index.module.css";

export function Tags() {
    const [_tagsInterval, setTagsInterval] = useState<NodeJS.Timeout>();
    const [isTagCreateOpened, setIsTagCreateOpened] = useState<boolean>(false);
    const tags = useTagsStore();
    const profile = useProfileStore();
    const isFetching = useRef(false);

    useEffect(() => {
        let mounted = true;

        const fetchTags = async () => {
            if (isFetching.current) return;

            isFetching.current = true;
            try {
                await tags.fetch();
            } finally {
                if (mounted) {
                    isFetching.current = false;
                }
            }
        };

        fetchTags();

        const id = setInterval(fetchTags, config.time.update.tags);
        setTagsInterval(id);

        return () => {
            mounted = false;
            clearInterval(id);
        };
    }, []);

    return (
        <WindowBox title="Теги">
            <div className={styles.tags}>
                {tags.tags.length === 0 ? (
                    <p className={styles.empty}>Нет тегов</p>
                ) : (
                    tags.tags.map((tag, _index) => (
                        <Tag key={tag.name} tag={tag} />
                    ))
                )}
                {profile.isAuthenticated() ? (
                    isTagCreateOpened ? (
                        <OpenedTagCreate setState={setIsTagCreateOpened} />
                    ) : (
                        <ClosedTagCreate setState={setIsTagCreateOpened} />
                    )
                ) : null}
            </div>
        </WindowBox>
    );
}
