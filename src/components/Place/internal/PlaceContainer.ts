import { Viewport } from "pixi-viewport";
import type { DragEvent } from "pixi-viewport/dist/types";
import { Container, Point, FederatedPointerEvent } from "pixi.js";
import type { RefObject } from "preact";
import { AppColor, AppFetch, AppWebSocket } from "@classes";
import {
    usePaletteStore,
    useProfileStore,
    useCoordinatesStore,
    useInfoStore,
    usePickerStore,
    useNotificationsStore,
    usePlaceStore,
    useCooldownStore,
    useOverlayStore,
    useSnapshotStore
} from "@stores";
import { ClientNotificationMap } from "@utils";
import { PlacePointer } from "./PlacePointer";
import { PlaceView } from "./PlaceView";
import { PlaceOverlay } from "./PlaceOverlay";
import { PlaceSnapshot } from "./PlaceSnapshot";
import { config } from "@config";

type Reason = "Cooldown" | "Not logged" | "Game ended" | "Banned";

export class PlaceContainer extends Container {
    private pointer = new PlacePointer();
    private place = new PlaceView();
    private overlay = new PlaceOverlay();
    private snapshot = new PlaceSnapshot();

    private pixelInfo = {
        lastPoint: new Point(-1, -1),
        lastPointTimeout: -1,
        timeoutId: -1
    };

    constructor(
        private viewport: Viewport,
        private canvasRef: RefObject<HTMLCanvasElement>
    ) {
        super();

        this.setup();
    }

    public onClick(event: DragEvent) {
        const ev = event.event as FederatedPointerEvent;
        const position = ev.getLocalPosition(this);
        const placePoint = new Point(
            Math.floor(position.x),
            Math.floor(position.y)
        );
        const image = usePlaceStore.getState().image;

        const overlayImage = useOverlayStore.getState().image;
        const overlayPosition = useOverlayStore.getState().position;

        if (image === null) return;

        const isOutsideOfCanvas =
            placePoint.x < 0 ||
            placePoint.x > image.size.x ||
            placePoint.y < 0 ||
            placePoint.y > image.size.y;
        if (isOutsideOfCanvas) {
            return;
        }

        if (useSnapshotStore.getState().enable) {
            ev.button === 2
                ? useSnapshotStore.getState().stop()
                : useSnapshotStore.getState().onPointerClick(placePoint);
            return;
        }

        if (overlayPosition === null || overlayImage === null) {
            this.place.onClick(placePoint, ev.button);
            return;
        }

        const isOnTopOfOverlay =
            placePoint.x <= overlayImage.size.x + overlayPosition.x &&
            placePoint.x >= overlayPosition.x &&
            placePoint.y <= overlayImage.size.y + overlayPosition.y &&
            placePoint.y >= overlayPosition.y;

        if (!isOnTopOfOverlay) {
            this.place.onClick(placePoint, ev.button);
            return;
        }

        const overlayPoint = placePoint
            .clone()
            .set(
                placePoint.x - overlayPosition.x,
                placePoint.y - overlayPosition.y
            );
        const color = overlayImage.getPixel(overlayPoint);

        if (color.alpha === 0) {
            this.place.onClick(placePoint, ev.button);
            return;
        }

        if (ev.button === 0) {
            if (usePickerStore.getState().isEnabled) {
                this.onWillColorPick(color);
                return;
            }

            return this.onWillPlace(placePoint);
        }

        if (ev.button === 2) {
            return this.onWillColorPick(color);
        }
    }

    public setup() {
        this.on("cant-place", this.onCantPlace.bind(this));

        this.viewport.on("drag-start", this.onDragStart.bind(this));
        this.viewport.on("drag-end", this.onDragEnd.bind(this));

        this.place.on("will-place", this.onWillPlace.bind(this));
        this.place.on("place", this.onPlace.bind(this));
        this.place.on("will-color-pick", this.onWillColorPick.bind(this));
        this.place.on("hover", this.onHover.bind(this));
        this.place.on("out", this.onOut.bind(this));

        this.addChild(this.place);
        this.addChild(this.overlay);
        this.addChild(this.snapshot);
        this.addChild(this.pointer);
    }

    public onDragStart(event: DragEvent) {
        if (this.canvasRef.current)
            this.canvasRef.current.style.cursor = "grabbing";
    }

    public onDragEnd(event: DragEvent) {
        if (this.canvasRef.current)
            this.canvasRef.current.style.cursor = "crosshair";

        this.cursor = "default";
    }

    public onCantPlace({ reason }: { reason: Reason }) {
        useNotificationsStore.getState().addNotification({
            ...ClientNotificationMap[reason],
            type: "error"
        });

        this.pointer.startShake();
    }

    public onWillPlace(point: Point) {
        if (useCooldownStore.getState().hasCooldown()) {
            return this.emit("cant-place", { reason: "Cooldown" });
        }

        if (useProfileStore.getState().profile === null) {
            return this.emit("cant-place", { reason: "Not logged" });
        }

        if (
            useInfoStore.getState().info === null ||
            usePlaceStore.getState().image === null
        ) {
            return;
        }
        if (useInfoStore.getState().info!.ended) {
            return this.emit("cant-place", { reason: "Game ended" });
        }

        if (useProfileStore.getState().isBanned()) {
            return this.emit("cant-place", { reason: "Banned" });
        }

        const color = usePlaceStore.getState().image!.getPixel(point);

        this.place.setSquare(point, usePaletteStore.getState().selected);

        AppWebSocket.putPixel(point, usePaletteStore.getState().selected).catch(
            (_e) => {
                this.place.setSquare(point, color);
            }
        );
    }

    public onPlace(point: Point) {
        this.pointer.hover(point);
        // if (ProfileManager.isMod.value) {
        //     return
        // };
        useCooldownStore.getState().start();
    }

    public onHover(point: Point) {
        useCoordinatesStore.getState().setCoordinates(point);
        this.pointer.hover(point);

        if (useSnapshotStore.getState().captureMode)
            useSnapshotStore.getState().onPointerMove(point);

        if (this.pixelInfo.lastPoint.equals(point)) return;
        if (this.pixelInfo.timeoutId !== -1) {
            window.clearTimeout(this.pixelInfo.timeoutId);
            this.pixelInfo.timeoutId = -1;
        }

        useCoordinatesStore.getState().info = "loading";
        this.pixelInfo.lastPoint = point.clone();
        this.pixelInfo.timeoutId = window.setTimeout(() => {
            if (
                useCoordinatesStore.getState().coordinates.x === -1 ||
                useCoordinatesStore.getState().coordinates.y === -1
            ) {
                return;
            }
            useCoordinatesStore.getState().fetchInfo();
        }, config.time.pixelInfo);
    }

    public update() {
        this.place.texture.update();
    }

    public onOut() {
        useCoordinatesStore.getState().removeCoordinates();
        this.pointer.out();
    }

    public onWillColorPick(color: AppColor) {
        usePickerStore.getState().isEnabled = false;

        this.pointer.background.tint = color;
        this.pointer.border.tint = color.getReadableColor();

        usePaletteStore.getState().addAndSelect(color);
    }
}
