import styles from "./index.module.css";

interface ParamProps {
    label: string;
    value: string;
}

export function Parameter({ label, value }: ParamProps) {
    return (
        <div className={styles.wrapper}>
            <p className={styles.label}>{label}</p>
            <p className={styles.value}>{value}</p>
        </div>
    );
}
