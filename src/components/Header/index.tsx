import { UniversalName } from "./UniversalName";
import { RightBlock } from "./RightBlock";
import styles from "./index.module.css";

export function Header() {
    return (
        <header className={styles.header}>
            <UniversalName />
            <RightBlock />
        </header>
    );
}
