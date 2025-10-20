import { FederatedPointerEvent, Point, Sprite, Texture } from "pixi.js";
import { useSnapshotStore, usePlaceStore, type SnapshotStore } from "@stores";
import { WHITE_TEXTURE } from "@utils";
import type { Viewport } from "pixi-viewport";

export enum Corner {
    LeftTop = 1,
    RightTop,
    LeftBottom,
    RightBottom
}

export class PlaceSnapshot extends Sprite {
    private dragging = false;
    private dragOffset = new Point();
    private viewport: Viewport;
    private edgeSize = 1.5;
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
        this.alpha = 0.5;

        this.on("pointerdown", this.onDragStart, this);
        this.on("pointerup", this.onDragEnd, this);
        this.on("pointerupoutside", this.onDragEnd, this);
        this.on("pointermove", this.onPointerMove, this);

        const update = (state: SnapshotStore) => {
            this.position = state.position;
            this.width = state.size.x;
            this.height = state.size.y;

            this.visible = state.enable;
            if (state.enable && !state.captureMode) {
                const size = usePlaceStore.getState().image!.size;
                this.position = new Point(0, 0);
                this.width = size.x;
                this.height = size.y;
                this.alpha = 0;
                this.isCaptureMode = true;
            } else {
                this.alpha = 0.5;
                this.isCaptureMode = false;
            }
        };
        useSnapshotStore.subscribe(update);
        update(useSnapshotStore.getState());

        // const successButton = new SnapshotButton(0x154cb7, () => {
        //     useSnapshotStore.setState({
        //         empty: false,
        //         enable: false
        //     });
        // });
        // const closeButton = new SnapshotButton(0xdb3131, () => {
        //     const { clear } = useSnapshotStore.getState();
        //     clear();
        // });
        // successButton.position.x = 0;
        // successButton.position.y = -6;
        // closeButton.position.x = 6;
        // closeButton.position.y = -6;
        // this.addChild(successButton);
        // this.addChild(closeButton);
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

            console.log(xdiff, ydiff);

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

        if (this.isCaptureMode) {
            return;
        }

        if (this.resizeCorner) {
            const dx = parentPos.x - this.startPos.x;
            const dy = parentPos.y - this.startPos.y;
            const rdx = parentPos.x - (this.startPos.x + this.startSize.x);

            switch (this.resizeCorner) {
                case Corner.RightBottom:
                    this.width = Math.min(
                        Math.max(1, dx + 0.45),
                        size.x - this.startPos.x
                    );
                    this.height = Math.min(
                        Math.max(1, dy + 0.45),
                        size.y - this.startPos.y
                    );
                    break;

                case Corner.RightTop:
                    this.width = Math.min(
                        Math.max(1, this.startSize.x + rdx) + 0.45,
                        size.x - this.startPos.x
                    );
                    this.height = Math.min(
                        Math.max(1, this.startSize.y - dy) + 0.45,
                        this.startPos.y + this.startSize.y
                    );
                    this.y = Math.max(
                        0,
                        Math.min(
                            this.startPos.y + dy - 0.45,
                            this.startPos.y + this.startSize.y - 1
                        )
                    );
                    break;

                case Corner.LeftBottom:
                    this.width = Math.min(
                        Math.max(1, this.startSize.x - dx) + 0.45,
                        this.startPos.x + this.startSize.x
                    );
                    this.height = Math.min(
                        Math.max(1, dy + 0.45),
                        size.y - this.startPos.y
                    );
                    this.x = Math.max(
                        0,
                        Math.min(
                            this.startPos.x + dx - 0.45,
                            this.startPos.x + this.startSize.x - 1
                        )
                    );
                    break;

                // LeftTop
                default:
                    this.width = Math.min(
                        Math.max(1, this.startSize.x - dx) + 0.45,
                        this.startPos.x + this.startSize.x
                    );
                    this.height = Math.min(
                        Math.max(1, this.startSize.y - dy) + 0.45,
                        this.startPos.y + this.startSize.y
                    );
                    this.x = Math.max(
                        0,
                        Math.min(
                            this.startPos.x + dx - 0.45,
                            this.startPos.x + this.startSize.x - 1
                        )
                    );
                    this.y = Math.max(
                        0,
                        Math.min(
                            this.startPos.y + dy - 0.45,
                            this.startPos.y + this.startSize.y - 1
                        )
                    );
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

        let cursor: string = "move";

        if (nearLeft && nearTop) {
            cursor = "nwse-resize";
            return Corner.LeftTop;
        }
        if (nearRight && nearTop) {
            cursor = "nesw-resize";
            return Corner.RightTop;
        }
        if (nearRight && nearBottom) {
            cursor = "nwse-resize";
            return Corner.RightBottom;
        }
        if (nearLeft && nearBottom) {
            cursor = "nesw-resize";
            return Corner.LeftBottom;
        }

        if (this.cursor !== cursor) this.cursor = cursor;
    }
}

class SnapshotButton extends Sprite {
    constructor(tint: number, onclick: () => void) {
        super(Texture.WHITE);
        this.tint = tint;
        this.on("pointerup", onclick, this);
        this.width = 5;
        this.height = 5;
    }
}
