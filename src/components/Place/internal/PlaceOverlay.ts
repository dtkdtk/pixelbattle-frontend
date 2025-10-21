import {
    Container,
    FederatedPointerEvent,
    Point,
    Sprite,
    Texture
} from "pixi.js";
import { OverlayViewMode, useOverlayStore, type OverlayState } from "@stores";
import { WHITE_TEXTURE } from "@utils";
import type { Viewport } from "pixi-viewport";
import type { PlaceOverlays } from "./PlaceOverlays";

export class PlaceOverlay extends Sprite {
    id: number;
    loaded = false;
    private dragging = false;
    private dragOffset = new Point();
    private viewport: Viewport;
    private isCurrent = false;

    constructor(id: number, viewport: Viewport) {
        super();
        this.id = id;
        this.interactive = true;

        this.eventMode = "static";
        this.hitArea = {
            contains: () => false
        };
        this.viewport = viewport;

        this.setup();
        this.on("pointerdown", this.onDragStart, this);
        this.on("pointerup", this.onDragEnd, this);
        this.on("pointerupoutside", this.onDragEnd, this);
        this.on("pointermove", this.onPointerMove, this);
        console.log("Start?");
    }

    private onDragStart(ev: FederatedPointerEvent) {
        const pos = ev.getLocalPosition(this.parent!);
        this.dragging = true;
        this.dragOffset.set(pos.x - this.x, pos.y - this.y);
        this.alpha = 0.7;
        this.viewport.plugins.pause("drag");
        console.log("Start?");
    }

    private onDragEnd() {
        this.dragging = false;
        this.alpha = 1;
        this.viewport.plugins.resume("drag");
        this.position.x = Math.round(this.x);
        this.position.y = Math.round(this.y);

        if (this.isCurrent)
            useOverlayStore.getState().setPosition(this.position);
    }

    private onPointerMove(ev: FederatedPointerEvent) {
        const parentPos = ev.getLocalPosition(this.parent!);

        if (this.dragging && this.isCurrent) {
            this.position.set(
                Math.round(parentPos.x - this.dragOffset.x),
                Math.round(parentPos.y - this.dragOffset.y)
            );
            (this.parent! as PlaceOverlays).updateCorners(this.id);
            return;
        }
    }

    private update = (v: OverlayState) => {
        this.isCurrent = v.current === this.id;
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
        if (this.parent) (this.parent! as PlaceOverlays).updateCorners(this.id);
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
