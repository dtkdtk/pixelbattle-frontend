import { Application, Point } from "pixi.js";
import { Viewport } from "pixi-viewport";
import type { RefObject } from "preact";
import type { PlaceState } from "@stores";
import { PlaceContainer } from "./PlaceContainer";
import { AppWebSocket } from "@classes";
import { config } from "@config";

export class PlaceApp {
    public app: Application;
    public viewport: Viewport;
    public container: PlaceContainer;

    private constructor(
        public canvasRef: RefObject<HTMLCanvasElement>,
        app: Application,
        viewport: Viewport,
        container: PlaceContainer
    ) {
        this.app = app;
        this.viewport = viewport;
        this.container = container;
    }

    public static async create(
        canvasRef: RefObject<HTMLCanvasElement>,
        place: PlaceState
    ): Promise<PlaceApp> {
        const app = new Application();
        await app.init({
            canvas: canvasRef.current!,
            width: window.innerWidth,
            height: window.innerHeight,
            backgroundColor: config.defaults.colors.background,
            preference: "webgpu"
        });

        const viewport = new Viewport({
            screenWidth: window.innerWidth,
            screenHeight: window.innerHeight,
            worldWidth: window.innerWidth * 2,
            worldHeight: window.innerHeight * 2,
            events: app.renderer.events,
            disableOnContextMenu: true
        });

        const container = new PlaceContainer(viewport, canvasRef);

        if (place.image !== null) {
            const { size } = place.image;

            viewport
                .drag()
                .pinch()
                .wheel()
                .fit(true, size.x, size.y)
                .zoomPercent(-config.zoom.defaultLevel, true)
                .clampZoom({
                    minWidth: viewport.worldWidth / 500,
                    minHeight: viewport.worldHeight / 500,
                    maxWidth: size.x * 5,
                    maxHeight: size.y * 5
                })
                .moveCenter(new Point(size.x / 2, size.y / 2))
                .on("clicked", container.onClick.bind(container));
        }

        app.stage.addChild(viewport);
        viewport.addChild(container);

        const instance = new PlaceApp(canvasRef, app, viewport, container);

        place.setContainer(container);
        AppWebSocket.connect();

        window.addEventListener(
            "resize",
            instance.onWindowResize.bind(instance)
        );

        return instance;
    }

    private onWindowResize() {
        this.app.renderer.resize(window.innerWidth, window.innerHeight);
        this.viewport.resize(window.innerWidth, window.innerHeight);
    }
}
