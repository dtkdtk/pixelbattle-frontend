import { Notification } from "./Notification";
import { useNotificationsStore } from "@stores";
import styles from "./index.module.css";

export const Notifications = () => {
    const notifications = useNotificationsStore();

    return (
        <div className={styles.notifications}>
            {notifications.notifications.map((notification) => (
                <Notification
                    key={notification.id}
                    notification={notification}
                />
            ))}
        </div>
    );
};
