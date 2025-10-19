import { AppColor } from "@classes";
import { usePlaceStore, usePickerStore } from "@stores";
import { Point, Sprite, FederatedPointerEvent, Texture } from "pixi.js";

export class PlaceView extends Sprite {
    get image() {
        if (usePlaceStore.getState().image === null) {
            throw new Error("Can't find image");
        }
        return usePlaceStore.getState().image!;
    }

    get size() {
        if (usePlaceStore.getState().image === null) {
            throw new Error("Can't find image");
        }
        return usePlaceStore.getState().image!.size;
    }

    public isZommed = false;
    public isDragged = false;

    constructor() {
        super();

        this.setup();
    }

    private async setup() {
        this.eventMode = "static";

        this.texture = Texture.from({
            resource: usePlaceStore.getState().image!.canvas,
            scaleMode: "nearest"
        });

        usePlaceStore
            .getState()
            .image!.canvas.addEventListener(
                "update",
                this.onPixelUpdate.bind(this)
            );
        this.on("pointermove", this.onPointerMove.bind(this));
        this.on("pointerout", this.onPointerOut.bind(this));
    }

    public async onClick(point: Point, mouseButton: number) {
        const color = this.image.getPixel(point);

        if (mouseButton === 0) {
            if (usePickerStore.getState().isEnabled) {
                return this.emit("will-color-pick", color);
            }

            return this.emit("will-place", point);
        }

        if (mouseButton === 2) {
            return this.emit("will-color-pick", color);
        }
    }

    private onPointerMove(event: FederatedPointerEvent) {
        const position = event.getLocalPosition(this);
        const { x: width, y: height } = this.image.size;

        if (
            position.x < 0 ||
            position.x > width ||
            position.y < 0 ||
            position.y > height
        )
            return;

        const point = new Point(Math.floor(position.x), Math.floor(position.y));

        this.emit("hover", point);
    }

    private onPointerOut(event: PointerEvent) {
        this.emit("out");
    }

    private onPixelUpdate() {
        this.texture.source.update();
    }

    public setSquare(pos: Point, color: AppColor) {
        this.image.setPixel(pos, color);

        this.emit("place", { point: pos, color });
    }
}
