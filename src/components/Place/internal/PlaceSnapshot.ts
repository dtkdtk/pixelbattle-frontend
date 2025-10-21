import {
    Container,
    FederatedPointerEvent,
    Point,
    Sprite,
    Texture
} from "pixi.js";
import { useSnapshotStore, usePlaceStore, type SnapshotStore } from "@stores";
import { WHITE_TEXTURE } from "@utils";
import type { Viewport } from "pixi-viewport";

export enum Corner {
    LeftTop = 1,
    RightTop,
    LeftBottom,
    RightBottom
}

export class PlaceSnapshot extends Container {
    leftTopCorner = new SnapshotCorner(1);
    rightTopCorner = new SnapshotCorner(1);
    leftBottomCorner = new SnapshotCorner(1);
    rightBottomCorner = new SnapshotCorner(1);
    cornerSize = 1;
    snapshot: Snapshot;
    constructor(viewport: Viewport) {
        super();
        const size = usePlaceStore.getState().image!.size;
        this.width = size.x;
        this.height = size.y;

        this.snapshot = new Snapshot(viewport);
        this.addChild(this.snapshot);
        this.addChild(this.leftTopCorner);
        this.addChild(this.rightTopCorner);
        this.addChild(this.leftBottomCorner);
        this.addChild(this.rightBottomCorner);

        const update = (state: SnapshotStore) => {
            this.alpha = state.enable && !state.captureMode ? 0 : 1;
            this.visible = state.enable;
        };
        update(useSnapshotStore.getState());
        useSnapshotStore.subscribe(update);
    }

    followCorners() {
        this.leftTopCorner.position = new Point(
            this.snapshot.x,
            this.snapshot.y
        );
        this.rightTopCorner.position = new Point(
            this.snapshot.x + this.snapshot.width,
            this.snapshot.y
        );
        this.leftBottomCorner.position = new Point(
            this.snapshot.x,
            this.snapshot.y + this.snapshot.height
        );
        this.rightBottomCorner.position = new Point(
            this.snapshot.x + this.snapshot.width,
            this.snapshot.y + this.snapshot.height
        );
    }
}

export class Snapshot extends Sprite {
    private dragging = false;
    private dragOffset = new Point();
    private viewport: Viewport;
    private edgeSize = 1;
    private resizeCorner: Corner | undefined;
    private startPos = new Point();
    private startSize = new Point();
    private isCaptureMode = false;
    private startPosCM = new Point();

    constructor(viewport: Viewport) {
        super(Texture.WHITE);
        this.viewport = viewport;
        this.interactive = true;
        this.cursor = "move";
        this.tint = 0x000000;

        this.width = 20;
        this.height = 20;
        this.texture = WHITE_TEXTURE;
        this.visible = false;
        this.alpha = 0;

        this.on("pointerdown", this.onDragStart, this);
        this.on("pointerup", this.onDragEnd, this);
        this.on("pointerupoutside", this.onDragEnd, this);
        this.on("globalpointermove", this.onPointerMove, this);

        const update = (state: SnapshotStore) => {
            this.position = state.position;
            this.width = state.size.x;
            this.height = state.size.y;

            this.visible = state.enable;
            if (state.enable && !state.captureMode) {
                this.alpha = 0;
                this.isCaptureMode = true;
            } else {
                this.alpha = 0.5;
                this.isCaptureMode = false;
            }
        };
        useSnapshotStore.subscribe(update);
        update(useSnapshotStore.getState());

        if (this.parent) (this.parent! as PlaceSnapshot).followCorners();
    }

    private onDragStart(ev: FederatedPointerEvent) {
        const pos = ev.getLocalPosition(this.parent!);
        this.dragging = true;
        this.dragOffset.set(pos.x - this.x, pos.y - this.y);
        this.alpha = 0.25;
        this.viewport.plugins.pause("drag");

        this.startPos = new Point(this.x, this.y);
        this.startSize = new Point(this.width, this.height);
        this.resizeCorner = this.updateAndGetCorner(ev);
        if (this.isCaptureMode) {
            this.startPosCM.set(pos.x, pos.y);
        }
    }

    private onDragEnd(ev: FederatedPointerEvent) {
        this.dragging = false;
        this.alpha = 0.5;
        this.viewport.plugins.resume("drag");
        this.resizeCorner = undefined;
        this.position.x = Math.round(this.x);
        this.position.y = Math.round(this.y);
        this.width = Math.round(this.width);
        this.height = Math.round(this.height);

        if (this.isCaptureMode) {
            const parentPos = ev.getLocalPosition(this.parent!);

            const x = this.width - parentPos.x;
            const y = this.height - parentPos.y;

            const xdiff = this.width - this.startPosCM.x - x;
            const ydiff = this.height - this.startPosCM.y - y;

            if (xdiff > 0) {
                this.position.x = Math.round(this.startPosCM.x);
                this.width = Math.round(xdiff);
            } else {
                this.position.x = Math.round(parentPos.x);
                this.width = -Math.round(xdiff);
            }
            if (ydiff > 0) {
                this.position.y = Math.round(this.startPosCM.y);
                this.height = Math.round(ydiff);
            } else {
                this.position.y = Math.round(parentPos.y);
                this.height = -Math.round(ydiff);
            }

            const size = usePlaceStore.getState().image!.size;

            this.width = Math.round(
                Math.min(this.width, size.x - this.startPosCM.x)
            );
            this.height = Math.round(
                Math.min(this.height, size.y - this.startPosCM.y)
            );
        }

        useSnapshotStore.setState({
            position: this.position,
            size: new Point(this.width, this.height),
            empty: false,
            captureMode: true
        });
    }

    private onPointerMove(ev: FederatedPointerEvent) {
        const parentPos = ev.getLocalPosition(this.parent!);
        const size = usePlaceStore.getState().image!.size;

        (this.parent! as PlaceSnapshot).followCorners();
        this.updateAndGetCorner(ev);

        if (this.isCaptureMode) {
            return;
        }

        if (this.resizeCorner) {
            const dx = parentPos.x - this.startPos.x;
            const dy = parentPos.y - this.startPos.y;

            switch (this.resizeCorner) {
                case Corner.RightBottom:
                    this.width = Math.min(dx, size.x - this.startPos.x);
                    this.height = Math.min(dy, size.y - this.startPos.y);
                    break;

                case Corner.RightTop:
                    this.width = Math.min(dx, size.x - this.startPos.x);
                    this.height = Math.min(
                        this.startSize.y - dy,
                        this.startPos.y + this.startSize.y
                    );
                    this.y = this.startPos.y + dy;
                    break;

                case Corner.LeftBottom:
                    this.width = Math.min(
                        this.startSize.x - dx,
                        this.startPos.x + this.startSize.x
                    );
                    this.height = Math.min(dy, size.y - this.startPos.y);
                    this.x = this.startPos.x + dx;
                    break;

                // LeftTop
                default:
                    this.width = Math.min(
                        this.startSize.x - dx,
                        this.startPos.x + this.startSize.x
                    );
                    this.height = Math.min(
                        this.startSize.y - dy,
                        this.startPos.y + this.startSize.y
                    );
                    this.x = this.startPos.x + dx;
                    this.y = this.startPos.y + dy;
                    break;
            }

            return;
        }

        if (this.dragging) {
            const newX = Math.min(
                Math.max(0, Math.round(parentPos.x - this.dragOffset.x)),
                size.x - this.width
            );
            const newY = Math.min(
                Math.max(0, Math.round(parentPos.y - this.dragOffset.y)),
                size.y - this.height
            );

            this.position.set(newX, newY);
            return;
        }
    }

    updateAndGetCorner(ev: FederatedPointerEvent): Corner | undefined {
        const local = ev.getLocalPosition(this);

        const lx = local.x * this.width;
        const ly = local.y * this.height;

        const nearLeft = lx <= this.edgeSize;
        const nearRight = lx >= this.width - this.edgeSize;
        const nearTop = ly <= this.edgeSize;
        const nearBottom = ly >= this.height - this.edgeSize;

        if (nearLeft && nearTop) {
            this.cursor = "nwse-resize";
            return Corner.LeftTop;
        }
        if (nearRight && nearTop) {
            this.cursor = "nesw-resize";
            return Corner.RightTop;
        }
        if (nearRight && nearBottom) {
            this.cursor = "nwse-resize";
            return Corner.RightBottom;
        }
        if (nearLeft && nearBottom) {
            this.cursor = "nesw-resize";
            return Corner.LeftBottom;
        }

        this.cursor = "move";
    }
}

class SnapshotCorner extends Container {
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
