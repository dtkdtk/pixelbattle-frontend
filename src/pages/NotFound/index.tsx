import { Link } from "wouter-preact";
import styles from "./index.module.css";

export function NotFound() {
    return (
        <div className={styles.container}>
            <section className={styles.wrapper}>
                <h1 className={styles.title}>Страница не найдена</h1>
                <p className={styles.message}>
                    Возможно вы перешли по неправильному адресу
                </p>
                <Link
                    to="/"
                    replace
                    className={styles.link}
                    state={{ skipPreload: true }}
                >
                    Вернуться на главную
                </Link>
            </section>
        </div>
    );
}
