import { Sprite, Texture } from "pixi.js";
import { OverlayViewMode, useOverlayStore, type OverlayState } from "@stores";
import { WHITE_TEXTURE } from "@utils";

export class PlaceOverlay extends Sprite {
    constructor(id: number) {
        super();

        this.eventMode = "static";
        this.hitArea = {
            contains: () => false
        };

        this.setup(id);
    }

    private setup(id: number) {
        const a = (v: OverlayState) => {
            if (
                (v.current !== id && v.viewMode !== OverlayViewMode.All) ||
                v.viewMode === OverlayViewMode.Nothing
            ) {
                this.hide();
                return;
            }

            const curr = v.overlays[id];
            curr.opacity && (this.alpha = curr.opacity / 100);
            if (curr.position) {
                this.position = curr.position;
            }
            this.show(id);
        };
        a(useOverlayStore.getState());
        useOverlayStore.subscribe(a);
    }

    private hide() {
        this.visible = false;

        this.texture = WHITE_TEXTURE;
    }

    private show(id: number) {
        this.visible = true;
        const state = useOverlayStore.getState();
        if (state.overlays[id] !== undefined)
            this.texture = Texture.from({
                resource: state.overlays[id].image.canvas,
                scaleMode: "nearest"
            });
    }
}
