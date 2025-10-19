import type { Dispatch, StateUpdater } from "preact/hooks";
import { Button } from "@components";
import { useTagsStore, useProfileStore, useNotificationsStore } from "@stores";
import styles from "./index.module.css";

interface ClosedTagCreateProps {
    setState: Dispatch<StateUpdater<boolean>>;
}

export function ClosedTagCreate({ setState }: ClosedTagCreateProps) {
    const tags = useTagsStore();

    function openTagCreate() {
        setState(true);
    }

    function deleteTag() {
        if (!useProfileStore.getState().user?.tag) {
            return;
            // maybe make a message about the impossibility of changing the tag due to its absence?
            // or make the button disabled when the tag is not set
        }

        tags.remove();
        useNotificationsStore.getState().addNotification({
            type: "success",
            title: "Изменение тега",
            message: "Тег был сброшен"
        });
    }

    return (
        <div className={styles.form}>
            <Button onClick={openTagCreate}>Новый тег</Button>
            <Button onClick={deleteTag} type="danger">
                Убрать текущий
            </Button>
        </div>
    );
}
