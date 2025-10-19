import { Icon } from "@components";
import { usePickerStore } from "@stores";
import styles from "./index.module.css";

export function ColorPick() {
    const picker = usePickerStore();

    return (
        <div className={styles.wrapper}>
            <input
                type="checkbox"
                name="color-pick"
                className={styles.input}
                onInput={() => picker.toggle()}
                checked={picker.isEnabled}
            />
            <Icon
                icon="color-picker"
                className={styles.icon}
                viewBoxSize={21}
            />
        </div>
    );
}
