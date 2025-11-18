import { Icon } from "@components";
import { usePickerStore } from "@stores";
import styles from "./index.module.css";

export function ProfilePick() {
    const picker = usePickerStore();

    return (
        <div className={styles.wrapper}>
            <input
                type="checkbox"
                name="profile-pick"
                className={styles.input}
                onInput={() => picker.toggle("profile")}
                checked={picker.isEnabled.profile}
            />
            <Icon icon="profile" className={styles.icon} viewBoxSize={16} />
        </div>
    );
}
