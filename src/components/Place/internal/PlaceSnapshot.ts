import { Sprite } from "pixi.js";
import { useSnapshotStore, usePlaceStore } from "@stores";
import { WHITE_TEXTURE } from "@utils";

export class PlaceSnapshot extends Sprite {
    constructor() {
        super();

        this.texture = WHITE_TEXTURE;
        this.visible = false;
        this.alpha = 0.5;

        this.setup();
    }

    private setup() {
        useSnapshotStore.subscribe((v) => {
            if (v.enable) this.visible = true;
            else this.visible = false;
        });
        useSnapshotStore.subscribe((v) => {
            this.x = v.offsetPoint.x;
            this.y = v.offsetPoint.y;
            const ov = useSnapshotStore.getState().startPoint;
            if (this.x === 0) {
                this.x = ov.x;
            }
            if (this.y === 0) {
                this.y = ov.y;
            }
        });
        useSnapshotStore.subscribe((v) => {
            const ov = useSnapshotStore.getState().offsetPoint;
            this.x = v.startPoint.x - ov.x;
            this.y = v.startPoint.y - ov.y;
            const i = usePlaceStore.getState().image;
            if (i) this.tint = i.getPixel(v.startPoint).getReadableColor();
        });

        useSnapshotStore.subscribe((v) => {
            this.width = Math.abs(v.size.x);
            this.height = Math.abs(v.size.y);
        });
    }
}
