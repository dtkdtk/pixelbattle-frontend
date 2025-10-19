export enum WebSocketStatus {
    CONNECTING,
    ACTIVE,
    CLOSED,
    ERRORED
}

export enum WebSocketError {
    NORMALLY,
    AWAY,
    CONNECTION,
    PROTOCOL,
    INTERNAL
}

export interface WebSocketState {
    status: WebSocketStatus;
    error: WebSocketError | null;
    attempts: number;
}

export interface PlaceMessageData {
    op: "PLACE";
    x: number;
    y: number;
    color: string;
}

export interface EndedMessageData {
    op: "ENDED";
    value: boolean;
}

export type MessageData = PlaceMessageData | EndedMessageData;
