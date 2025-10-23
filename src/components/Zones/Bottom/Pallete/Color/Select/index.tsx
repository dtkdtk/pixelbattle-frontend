import { usePaletteStore } from "@stores";
import { AppColor } from "@classes";
import styles from "./index.module.css";

interface ColorSelectProps {
    color: AppColor;
    selected: AppColor;
}

export const ColorSelect = ({ color, selected }: ColorSelectProps) => {
    const palette = usePaletteStore();

    return (
        <input
            type="radio"
            name="palette"
            value={color.toHex()}
            className={styles.color}
            style={{
                backgroundColor: color.toHex()
            }}
            checked={color.equals(selected)}
            onChange={() => palette.setCurrentColor(color)}
        />
    );
};
