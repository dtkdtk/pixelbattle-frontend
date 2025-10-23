import type { ComponentChildren } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";
import styles from "./index.module.css";

interface DropdownProps {
    name: ComponentChildren;
    children: ComponentChildren;
    className: string;
}

export function Dropdown({ name, children, className }: DropdownProps) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div
            className={styles.name_wrapper}
            onClick={() => setOpen((v) => !v)}
            ref={ref}
        >
            {name}
            <div
                className={`${styles.dropdown + " " + className} ${open ? styles.open : ""}`}
            >
                {children}
            </div>
        </div>
    );
}
