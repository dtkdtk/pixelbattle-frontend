import { useLocation } from "wouter-preact";
import { Dropdown, Icon, Parameter } from "@components";
import { useInfoStore, usePlaceStore } from "@stores";
import { config } from "@config";
import styles from "./index.module.css";

export function UniversalName() {
    const [location] = useLocation();
    const info = useInfoStore();
    const place = usePlaceStore();

    const isActive = location === "/" && info.info && place.image;

    return (
        <Dropdown
            name={
                <div className={styles.name_wrapper}>
                    <h1 className={styles.name}>
                        {isActive ? info.info!.name : "Pixel Battle"}
                    </h1>
                    {isActive && (
                        <div title={"Онлайн"} className={styles.online}>
                            <div className={styles.online_icon} />
                            {info.info!.online.toString()}
                        </div>
                    )}
                </div>
            }
            className={styles.wrapper}
        >
            {isActive && (
                <div className={styles.params}>
                    <Parameter
                        label="Кулдаун"
                        value={info.info!.cooldown + "мс"}
                    />
                    <Parameter
                        label="Размер"
                        value={place.image!.size.x + "x" + place.image!.size.y}
                    />
                    {/* <Parameter
                        label="Онлайн"
                        value={info.info!.online.toString()}
                    /> */}
                </div>
            )}
            <div className={styles.icons}>
                {Object.entries(config.media).map(([name, url]) => (
                    <a
                        href={url[0]}
                        target="_blank"
                        rel="noopener noreferrer"
                        key={name}
                    >
                        <Icon icon={name} size={35} viewBoxSize={256} />
                    </a>
                ))}
            </div>
        </Dropdown>
    );
}
