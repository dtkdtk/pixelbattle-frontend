import { useEffect, useState } from "preact/hooks";
import { Parameter, Icon /*Snowflake*/ } from "@components";
import { useInfoStore, usePlaceStore } from "@stores";
import { config } from "@config";
import styles from "./index.module.css";

export function TitleBar() {
    const info = useInfoStore();
    const place = usePlaceStore();
    const [_infoIntervalId, setInfoIntervalId] = useState<NodeJS.Timeout>();
    const [opened, setOpened] = useState<boolean>(false);
    const [show, setShow] = useState<boolean>(false);

    useEffect(() => {
        info.fetchInfo();

        setInfoIntervalId(setInterval(info.fetchInfo, config.time.update.info));

        setTimeout(() => {
            setShow(true);
        }, 1000);
    }, []);

    if (info.info === null || place.image === null) {
        return null;
    }

    const isFinished = info.info.ended;

    const name =
        info.info.name === "season:blank" ? "Без названия" : info.info.name;
    const icon = isFinished ? "🏁" : "⚔️";

    const click = () => {
        setOpened(!opened);
    };

    return (
        <div
            className={`${styles.window} ${opened ? styles.opened : styles.closed}`}
            onClick={click}
        >
            <label for={styles.window} className={styles.title}>
                {name} {icon}
            </label>
            <div className={styles.content}>
                {show && (
                    <div className={styles.container}>
                        <div className={styles.params}>
                            <Parameter
                                label="Кулдаун"
                                value={info.info.cooldown + "мс"}
                            />
                            <Parameter
                                label="Размер"
                                value={
                                    place.image.size.x +
                                    "x" +
                                    place.image.size.y
                                }
                            />
                            <Parameter
                                label="Онлайн"
                                value={info.info.online.toString()}
                            />
                        </div>
                        <div className={styles.icons}>
                            <div className={styles.media}>
                                {Object.entries(config.media).map(
                                    ([name, url]) => (
                                        <a
                                            href={url[0]}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            key={name}
                                        >
                                            <Icon
                                                icon={name}
                                                size={35}
                                                viewBoxSize={256}
                                            />
                                            {/* <img src={`/images/icons/${name}.svg`} alt={name} width={35} height={35}/> */}
                                        </a>
                                    )
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
