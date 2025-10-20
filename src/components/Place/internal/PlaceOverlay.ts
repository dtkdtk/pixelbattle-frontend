import { Sprite, Texture } from "pixi.js";
import { OverlayViewMode, useOverlayStore, type OverlayState } from "@stores";
import { WHITE_TEXTURE } from "@utils";

export class PlaceOverlay extends Sprite {
    id: number;
    loaded = false;

    constructor(id: number) {
        super();
        this.id = id;

        this.eventMode = "static";
        this.hitArea = {
            contains: () => false
        };

        this.setup();
    }

    private update = (v: OverlayState) => {
        if (
            (v.current !== this.id && v.viewMode !== OverlayViewMode.All) ||
            v.viewMode === OverlayViewMode.Nothing
        ) {
            this.hide();
            return;
        }

        const curr = v.overlays[this.id];
        if (!curr) return;
        curr.opacity && (this.alpha = curr.opacity / 100);
        if (curr.position) {
            this.position = curr.position;
        }
        if (!this.loaded) this.show();
        this.loaded = true;
    };

    private setup() {
        this.update(useOverlayStore.getState());
        useOverlayStore.subscribe(this.update);
    }

    private hide() {
        this.visible = false;

        this.texture = WHITE_TEXTURE;
    }

    private show() {
        this.visible = true;
        const state = useOverlayStore.getState();
        if (
            state.overlays[this.id] !== undefined &&
            state.overlays[this.id].image
        )
            this.texture = Texture.from({
                resource: state.overlays[this.id].image.canvas,
                scaleMode: "nearest"
            });
        else {
            setTimeout(() => this.update(useOverlayStore.getState()), 100);
        }
    }
}
