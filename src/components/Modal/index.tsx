import { Icon } from "@components";
import { useModalStore } from "@stores";
import styles from "./index.module.css";

export function Modal() {
    const modal = useModalStore();

    if (!modal.modal) return null;

    return (
        <div className={styles.background}>
            <div className={styles.modal}>
                <div className={styles.top}>
                    <h3 className={styles.title}>{modal?.modal.title}</h3>
                    <button
                        className={styles.close}
                        onClick={() => modal.close()}
                    >
                        <Icon icon="plus" />
                    </button>
                </div>
                <div className={styles.body}>{modal.modal?.children}</div>
            </div>
        </div>
    );
}

export * from "./ProfileView";
