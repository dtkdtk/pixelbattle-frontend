import type { PixelInfo } from "@interfaces";
import styles from "./index.module.css";

export function Info({ info }: { info: PixelInfo | null | "loading" }) {
    if (info === null) {
        return (
            <div className={[styles.wrapper, styles.empty].join(" ")}>
                Пусто
            </div>
        );
    }

    if (info === "loading") {
        return (
            <div
                className={styles.wrapper}
                style={{
                    opacity: info ? 1 : 0
                }}
            >
                Загрузка...
            </div>
        );
    }

    const author = info.author;

    return (
        <div className={styles.wrapper}>
            <p className={styles.info}>
                <strong className={styles.author}>
                    {author?.username ?? "Без автора"}
                </strong>
                {info.tag && (
                    <span className={styles.tag}>{info.tag.name}</span>
                )}
            </p>
        </div>
    );
}
