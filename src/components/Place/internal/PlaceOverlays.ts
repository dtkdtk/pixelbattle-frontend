import { useOverlayStore, usePlaceStore, type OverlayState } from "@stores";
import { Container, Sprite } from "pixi.js";
import { PlaceOverlay } from "./PlaceOverlay";
import type { Viewport } from "pixi-viewport";
import { WHITE_TEXTURE } from "@utils";

export class PlaceOverlays extends Container {
    sprites: Sprite[] = [];
    corners: Corner[] = [];
    constructor(viewport: Viewport) {
        super();

        const size = usePlaceStore.getState().image!.size;
        this.width = size.x;
        this.height = size.y;

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
                    this.addCorners(i);
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

    addCorners(id: number) {
        const createCorner = (x: number, y: number) => {
            const c = new Corner(2);
            c.position.set(x, y);
            return c;
        };
        const overlay = useOverlayStore.getState().overlays[id];
        [
            createCorner(overlay.position.x, overlay.position.y),
            createCorner(
                overlay.position.x + overlay.image.size.x,
                overlay.position.y
            ),
            createCorner(
                overlay.position.x,
                overlay.position.y + overlay.image.size.y
            ),
            createCorner(
                overlay.position.x + overlay.image.size.x,
                overlay.position.y + overlay.image.size.y
            )
        ].map((v) => {
            this.addChild(v);
            this.corners.push(v);
        });
    }

    updateCorners(id: number) {
        const align = id * 4;
        const overlay = useOverlayStore.getState().overlays[id];
        this.corners[align].position.set(
            overlay.position.x,
            overlay.position.y
        );
        this.corners[align + 1].position.set(
            overlay.position.x + overlay.image.size.x,
            overlay.position.y
        );
        this.corners[align + 2].position.set(
            overlay.position.x,
            overlay.position.y + overlay.image.size.y
        );
        this.corners[align + 3].position.set(
            overlay.position.x + overlay.image.size.x,
            overlay.position.y + overlay.image.size.y
        );
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
