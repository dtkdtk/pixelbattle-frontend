import {
    ColorCreate,
    ColorDelete,
    ColorPick,
    ProfilePick,
    ColorSelect
} from "./Color";
import { PaletteGroup } from "./Group";
import { usePaletteStore } from "@stores";
import styles from "./index.module.css";

export const Palette = () => {
    const palette = usePaletteStore();

    return (
        <div className={styles.palette}>
            <PaletteGroup scrollable>
                {palette.colors.map((color) => (
                    <ColorSelect color={color} selected={palette.selected} />
                ))}
            </PaletteGroup>
            <hr className={styles.hr} />
            <PaletteGroup>
                <ColorCreate />
                <ColorPick />
                <ProfilePick />
                <ColorDelete />
            </PaletteGroup>
        </div>
    );
};
