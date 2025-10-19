import {
    WebSocketError,
    type WebSocketState,
    WebSocketStatus
} from "@interfaces";
import { PlaceView } from "@place-internal";
import { AppColor } from "@classes";
//import { GeneralDaemon } from "./general";
import { Envelope } from "@proto";
import { Point } from "pixi.js";
import {
    useNotificationsStore,
    useWebsocketStore,
    useCooldownStore,
    usePlaceStore
} from "@stores";
import { objectsEqual, ConnectionNotificationMap } from "@utils";
import { config } from "@config";

export class AppWebSocket {
    private static connection: WebSocket;
    private static interval: NodeJS.Timeout;

    public static connect() {
        AppWebSocket.setState({
            status: WebSocketStatus.CONNECTING
        });
        this.createWebSocket();
        this.setupEventListeners();
        if (this.interval) clearInterval(this.interval);
        this.interval = setInterval(() => {
            if (AppWebSocket.state.status === WebSocketStatus.ACTIVE) {
                const time = Date.now();
                const id = this.nextId;
                const data = Envelope.encode({
                    id: id,
                    timestamp: time,
                    ping: {
                        senderSendTime: time
                    }
                });
                this.resp.set(id, time);
                this.connection.send(data.finish());
            }
        }, 5000);
    }

    private static _nextId = 0;

    private static get nextId() {
        if (!this._nextId) this._nextId = 0;
        return this._nextId++;
    }

    private static createWebSocket() {
        this.connection = new WebSocket(
            config.url.api.replace("http", "ws") + "/socket?z=123123123123"
        );
    }

    private static setupEventListeners() {
        AppWebSocket.connection.onopen = this.onOpen.bind(this);
        AppWebSocket.connection.onmessage = this.onMessage.bind(this);
        AppWebSocket.connection.onclose = this.onClose.bind(this);
        AppWebSocket.connection.onerror = this.onError.bind(this);
        AppWebSocket.connection.binaryType = "arraybuffer";
    }

    private static send(obj: ArrayBufferLike) {}

    public static async putPixel(coordinates: Point, color: AppColor) {
        const data = Envelope.encode({
            id: this.nextId,
            timestamp: Date.now(),
            pixel: {
                id:
                    coordinates.x +
                    coordinates.y * usePlaceStore.getState().image!.size.x,
                color: color.toNumber()
            }
        });
        if (AppWebSocket.state.status === WebSocketStatus.ACTIVE) {
            AppWebSocket.connection.send(data.finish());
        }
    }

    private static resp: Map<number, number> = new Map();
    private static rttSamples: number[] = [];
    public static get rtt() {
        return this.rttSamples[0] ?? -1;
    }
    public static get jitter() {
        let jitter = 0;
        if (this.rttSamples.length > 1) {
            let sum = 0;
            for (let i = 1; i < this.rttSamples.length; i++) {
                sum += Math.abs(this.rttSamples[i] - this.rttSamples[i - 1]);
            }
            jitter = sum / (this.rttSamples.length - 1);
        } else {
            jitter = 0;
        }
        return jitter;
    }

    private static async onMessage(event: MessageEvent) {
        const data = Envelope.decode(new Uint8Array(event.data));

        if (data.pong) {
            const rtt = Date.now() - Number(data.pong.senderSendTime!);
            let jitter;
            this.rttSamples.push(rtt);
            if (this.rttSamples.length > 10) this.rttSamples.shift();
            if (this.rttSamples.length > 1) {
                let sum = 0;
                for (let i = 1; i < this.rttSamples.length; i++) {
                    sum += Math.abs(
                        this.rttSamples[i] - this.rttSamples[i - 1]
                    );
                }
                jitter = sum / (this.rttSamples.length - 1);
            } else {
                jitter = 0;
            }
            console.log(`RTT: ${rtt} ms, Jitter: ${jitter} ms`);
        }

        if (data.pixel) {
            usePlaceStore
                .getState()
                .image!.setPixel(
                    new Point(
                        data.pixel.id! % usePlaceStore.getState().image!.size.x,
                        Math.floor(
                            data.pixel.id! /
                                usePlaceStore.getState().image!.size.x
                        )
                    ),
                    new AppColor(data.pixel.color ?? 0)
                );
        }

        if (data.error) {
            if (ConnectionNotificationMap[data.error.code])
                useNotificationsStore.getState().addNotification({
                    ...ConnectionNotificationMap[data.error.code],
                    type: "error"
                });
        }
    }

    private static onOpen() {
        AppWebSocket.setState({
            status: WebSocketStatus.ACTIVE,
            error: undefined
        });
        //GeneralDaemon.sync();
    }

    private static onError(_: Event) {
        AppWebSocket.setState({
            status: WebSocketStatus.CLOSED,
            error: WebSocketError.CONNECTION
        });
        AppWebSocket.reconnect();
    }

    private static onClose(event: CloseEvent) {
        switch (event.code) {
            case 1000:
                AppWebSocket.setState({ status: WebSocketStatus.CLOSED });
                return;
            case 1001:
                AppWebSocket.setState({
                    status: WebSocketStatus.CLOSED,
                    error: WebSocketError.AWAY
                });
                return;
            case 1006:
                AppWebSocket.setState({
                    status: WebSocketStatus.CLOSED,
                    error: WebSocketError.CONNECTION
                });
                AppWebSocket.reconnect();
                return;
            case 1008:
                AppWebSocket.setState({
                    status: WebSocketStatus.CLOSED,
                    error: WebSocketError.PROTOCOL
                });
                return;
            case 1011:
                AppWebSocket.setState({
                    status: WebSocketStatus.CLOSED,
                    error: WebSocketError.INTERNAL
                });
                return;
            default:
                AppWebSocket.setState({
                    status: WebSocketStatus.CLOSED,
                    error: WebSocketError.CONNECTION
                });
        }
    }

    static get closed() {
        return (
            AppWebSocket.connection.readyState === WebSocket.CLOSED ||
            AppWebSocket.connection.readyState === WebSocket.CLOSING
        );
    }

    private static reconnect() {
        if (!AppWebSocket.closed) return;
        if (AppWebSocket.state.attempts >= config.ws.reconnectAttempts) return;
        setTimeout((() => this.connect()).bind(this), config.ws.reconnect);
        AppWebSocket.state.attempts++;
    }

    private static setState(state: Partial<WebSocketState>) {
        const prev = useWebsocketStore.getState();
        const next = { ...prev, ...state };
        if (objectsEqual(prev, next)) return;
        useWebsocketStore.setState(
            state as Pick<WebSocketState, keyof WebSocketState>
        );
    }

    static get state(): WebSocketState {
        return useWebsocketStore.getState();
    }

    static on(f: (state: WebSocketState, prevState: WebSocketState) => void) {
        return useWebsocketStore.subscribe(f);
    }
}
