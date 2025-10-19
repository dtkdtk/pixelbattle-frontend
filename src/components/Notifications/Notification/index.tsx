import { useEffect, useState } from "preact/hooks";
import { useNotificationsStore, type NotificationInfo } from "@stores";
import { config } from "@config";
import styles from "./index.module.css";

export const Notification = ({
    notification
}: {
    notification: NotificationInfo;
}) => {
    const [className, setClassName] = useState("");
    const [_time, setTime] = useState<NodeJS.Timeout>(setTimeout(() => {}, 0));

    useEffect(() => {
        setTime(
            setTimeout(() => {
                const animationTime = 200;

                setClassName(styles.animate);
                setTimeout(
                    () =>
                        useNotificationsStore
                            .getState()
                            .removeNotification(notification.id),
                    animationTime
                );
            }, config.time.notificationRemoved)
        );
    }, []);

    return (
        <div
            className={[
                styles.notification,
                styles[notification.type],
                className
            ].join(" ")}
        >
            <p className={styles.title}>{notification.title}</p>
            <p className={styles.message}>{notification.message}</p>
        </div>
    );
};
