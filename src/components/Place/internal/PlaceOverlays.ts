import { useOverlayStore, type OverlayState } from "@stores";
import { Container, Sprite } from "pixi.js";
import { PlaceOverlay } from "./PlaceOverlay";

export class PlaceOverlays extends Container {
    sprites: Sprite[] = [];
    constructor() {
        super();

        this.eventMode = "static";
        this.hitArea = {
            contains: () => false
        };

        this.setup();
    }

    private setup() {
        const check = (vi: OverlayState, vo?: OverlayState) => {
            const ai = vi.overlays.length;
            const bi = vo === undefined ? 0 : vo.overlays.length;

            if (ai > bi) {
                for (let i = bi; i < ai; i++) {
                    const v = new PlaceOverlay(i);
                    this.sprites.push(v);
                    this.addChild(v);
                }
            }
            if (ai < bi) {
                const v = this.sprites[bi - 1];
                this.removeChild(v);
                this.sprites = this.sprites.filter(
                    (vi, vo, _) => vo !== bi - 1
                );
            }
        };
        check(useOverlayStore.getState());
        useOverlayStore.subscribe(check);
    }
}
