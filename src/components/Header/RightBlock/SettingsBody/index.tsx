import { Button } from "@components";
import styles from "./index.module.css";

export function SettingsBody() {
    return (
        <div class={styles.wrapper}>
            Что-то типа настроек
            <Button href="/logout">Сохранить</Button>
        </div>
    );
}
