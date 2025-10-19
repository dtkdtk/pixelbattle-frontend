import { Sprite, Texture } from "pixi.js";
import { useOverlayStore } from "@stores";
import { WHITE_TEXTURE } from "@utils";

export class PlaceOverlay extends Sprite {
    constructor() {
        super();

        this.eventMode = "static";
        this.hitArea = {
            contains: () => false
        };

        this.setup();
    }

    private setup() {
        useOverlayStore.subscribe(
            (v) => v.opacity && (this.alpha = v.opacity / 100)
        );
        useOverlayStore.subscribe((v) => {
            if (v.position) {
                this.position = v.position;
            }
        });
        useOverlayStore.subscribe((v) => (v.image ? this.show() : this.hide()));
    }

    private hide() {
        this.visible = false;

        this.texture = WHITE_TEXTURE;
    }

    private show() {
        this.visible = true;

        this.texture = Texture.from({
            resource: useOverlayStore.getState().image!.canvas,
            scaleMode: "nearest"
        });
    }
}
