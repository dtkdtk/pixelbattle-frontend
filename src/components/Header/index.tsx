import { UniversalName } from "./UniversalName";
import { RightBlock } from "./RightBlock";
import { useProfileStore } from "@stores";
import styles from "./index.module.css";

export function Header() {
    const isBanned = useProfileStore((state) => state.isBanned());

    return (
        <header
            className={styles.header}
            style={{ backgroundSize: `${isBanned ? 100 : 0}% 2px` }}
        >
            <UniversalName />
            <RightBlock />
        </header>
    );
}
