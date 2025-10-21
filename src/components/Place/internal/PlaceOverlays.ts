import { useOverlayStore, usePlaceStore, type OverlayState } from "@stores";
import { Container, Sprite } from "pixi.js";
import { PlaceOverlay } from "./PlaceOverlay";
import type { Viewport } from "pixi-viewport";
import { WHITE_TEXTURE } from "@utils";

export class PlaceOverlays extends Container {
    sprites: Sprite[] = [];
    constructor(viewport: Viewport) {
        super();
        this.interactiveChildren = true;

        this.eventMode = "static";
        this.hitArea = {
            contains: () => false
        };

        this.setup(viewport);
    }

    private setup(viewport: Viewport) {
        const check = (vi: OverlayState, vo?: OverlayState) => {
            const ai = vi.overlays.length;
            const bi = vo === undefined ? 0 : vo.overlays.length;

            if (ai > bi) {
                for (let i = bi; i < ai; i++) {
                    const v = new PlaceOverlay(i, viewport);
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

class Corner extends Container {
    border: Sprite;
    background: Sprite;

    constructor(size: number) {
        super();

        this.background = new Sprite(WHITE_TEXTURE);
        this.background.width = size;
        this.background.height = size;
        this.background.tint = 0xb2d8d8;
        this.background.anchor.set(0.5);

        this.border = new Sprite(WHITE_TEXTURE);
        this.border.width = size + 0.25;
        this.border.height = size + 0.25;
        this.border.tint = 0x000000;
        this.border.anchor.set(0.5);

        this.addChild(this.border);
        this.addChild(this.background);
        this.interactive = false;
        this.interactiveChildren = false;
    }
}
