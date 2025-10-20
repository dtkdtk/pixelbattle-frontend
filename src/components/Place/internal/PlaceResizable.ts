import type { Viewport } from "pixi-viewport";
import { FederatedPointerEvent, Point, Sprite, Texture } from "pixi.js";

export enum Corner {
    LeftTop = 1,
    RightTop,
    LeftBottom,
    RightBottom
}

export class PlaceResizable extends Sprite {
    private dragging = false;
    private dragOffset = new Point();
    private viewport: Viewport;
    private edgeSize = 1;
    private resizeCorner: Corner | undefined;
    private startPos = new Point();
    private startSize = new Point();

    constructor(viewport: Viewport) {
        super(Texture.WHITE);
        this.viewport = viewport;
        this.interactive = true;
        this.cursor = "move";
        this.tint = 0x000000;

        this.width = 20;
        this.height = 20;

        this.on("pointerdown", this.onDragStart, this);
        this.on("pointerup", this.onDragEnd, this);
        this.on("pointerupoutside", this.onDragEnd, this);
        this.on("pointermove", this.onPointerMove, this);
    }

    private onDragStart(ev: FederatedPointerEvent) {
        const pos = ev.getLocalPosition(this.parent!);
        this.dragging = true;
        this.dragOffset.set(pos.x - this.x, pos.y - this.y);
        this.alpha = 0.7;
        this.viewport.plugins.pause("drag");

        this.startPos = new Point(this.x, this.y);
        this.startSize = new Point(this.width, this.height);
        this.resizeCorner = this.updateAndGetCorner(ev);
    }

    private onDragEnd() {
        this.dragging = false;
        this.alpha = 1;
        this.viewport.plugins.resume("drag");
        this.resizeCorner = undefined;
        this.position.x = Math.round(this.x);
        this.position.y = Math.round(this.y);
        this.width = Math.round(this.width);
        this.height = Math.round(this.height);
    }

    private onPointerMove(ev: FederatedPointerEvent) {
        const parentPos = ev.getLocalPosition(this.parent!);

        if (this.resizeCorner) {
            const dx = parentPos.x - this.startPos.x;
            const dy = parentPos.y - this.startPos.y;

            const rdx = parentPos.x - (this.startPos.x + this.startSize.x);

            switch (this.resizeCorner) {
                case Corner.RightBottom:
                    this.width = Math.max(1, dx + 0.45);
                    this.height = Math.max(1, dy + 0.45);
                    break;

                case Corner.RightTop:
                    this.width = Math.max(1, this.startSize.x + rdx) + 0.45;
                    this.height = Math.max(1, this.startSize.y - dy) + 0.45;
                    this.y = this.startPos.y + dy - 0.45;
                    break;

                case Corner.LeftBottom:
                    this.width = Math.max(1, this.startSize.x - dx) + 0.45;
                    this.height = Math.max(1, dy + 0.45);
                    this.x = this.startPos.x + dx - 0.45;
                    break;

                //LeftTop
                default:
                    this.width = Math.max(1, this.startSize.x - dx) + 0.45;
                    this.height = Math.max(1, this.startSize.y - dy) + 0.45;
                    this.x = this.startPos.x + dx - 0.45;
                    this.y = this.startPos.y + dy - 0.45;
                    break;
            }

            return;
        }

        if (this.dragging) {
            this.position.set(
                Math.round(parentPos.x - this.dragOffset.x),
                Math.round(parentPos.y - this.dragOffset.y)
            );
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
