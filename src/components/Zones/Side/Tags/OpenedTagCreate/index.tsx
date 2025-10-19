import { useState, type Dispatch, type StateUpdater } from "preact/hooks";
import { Button, TextField, Icon } from "@components";
import { useTagsStore, useNotificationsStore } from "@stores";
import styles from "./index.module.css";

interface OpenedTagCreateProps {
    setState: Dispatch<StateUpdater<boolean>>;
}

export function OpenedTagCreate({ setState }: OpenedTagCreateProps) {
    const tags = useTagsStore();
    const [input, setInput] = useState<string>("");

    function createTag() {
        if (input === "") {
            return;
        }

        tags.selectAndFetch(input);
        useNotificationsStore.getState().addNotification({
            type: "success",
            title: "Изменение тега",
            message: `Ваш новый тег: ${input}`
        });

        setState(false);
    }

    function closeTagCreate() {
        setState(false);
    }

    return (
        <div className={styles.form}>
            <TextField
                placeholder="Новый тег"
                onInput={setInput}
                min={4}
                max={8}
            />
            <Button onClick={createTag}>
                <Icon icon="plus" />
            </Button>
            <Button onClick={closeTagCreate} type="danger">
                <Icon icon="plus" className={styles.closeIcon} />
            </Button>
        </div>
    );
}
