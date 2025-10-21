import type { Point } from "pixi.js";
import type {
    ApiErrorResponse,
    ApiInfo,
    ApiResponse,
    ApiTags,
    PixelInfo,
    ProfileInfo
} from "@interfaces";
import { useNotificationsStore, useProfileStore } from "@stores";
import { ServerNotificationMap } from "@utils";
import { config } from "@config";

export class AppFetch {
    public static pixels() {
        return new Promise<HTMLImageElement>((resolve, reject) => {
            const img = new Image();
            let url = config.url.api + "/pixels.png";

            if (history.state?.skipPreload) {
                url += "?z";

                history.replaceState(
                    {
                        ...history.state,
                        skipPreload: false
                    },
                    ""
                );
            }

            img.src = url;
            img.crossOrigin = "anonymous";

            img.onload = () => resolve(img);
            img.onerror = (e) => reject(e);
        });
    }

    public static info(): Promise<ApiInfo> {
        return AppFetch.get("/game");
    }

    public static profile(): Promise<ProfileInfo> {
        return AppFetch.get<ProfileInfo>(`/users/me`, true);
    }

    public static userProfile(id: string): Promise<ProfileInfo> {
        return AppFetch.get<ProfileInfo>(`/users/by-id/${id}`, true);
    }

    public static tag(id: string): Promise<ProfileInfo> {
        return AppFetch.get<ProfileInfo>(`/tags/by-id/${id}`, true);
    }

    public static getPixel(coordinates: Point): Promise<PixelInfo> {
        return AppFetch.get<PixelInfo>(
            `/pixels?x=${coordinates.x}&y=${coordinates.y}`
        );
    }

    public static tags(): Promise<ApiTags> {
        return AppFetch.get(`/pixels/tag`);
    }

    public static changeTag(tag: string): Promise<ApiResponse> {
        return AppFetch.post(
            `/users/${useProfileStore.getState().profile!.id}/tag`,
            { tag },
            true
        );
    }

    private static post = <T extends object>(
        url: string,
        body: unknown,
        withCredentials: boolean = false
    ) => AppFetch.fetch<T>({ url, method: "POST", withCredentials, body });

    private static put = <T extends object>(
        url: string,
        body: unknown,
        withCredentials: boolean = false
    ) => AppFetch.fetch<T>({ url, method: "PUT", withCredentials, body });

    private static get = <T extends object>(
        url: string,
        withCredentials: boolean = false
    ) => AppFetch.fetch<T>({ url, method: "GET", withCredentials });

    private static fetch<T extends object>(options: {
        url: string;
        method: "POST" | "PUT" | "GET";
        withCredentials: boolean;
        body?: unknown;
    }) {
        const headers: HeadersInit = {
            "Content-Type": "application/json"
        };

        return fetch(config.url.api + options.url, {
            method: options.method,
            headers: options.method === "GET" ? undefined : headers,
            body: options.body ? JSON.stringify(options.body) : undefined,
            credentials: options.withCredentials ? "include" : "omit"
        })
            .then((res) => res.json() as Promise<T | ApiErrorResponse>)
            .then(AppFetch.checkForErrors<T>);
    }

    private static checkForErrors<T extends object | ApiErrorResponse>(
        res: T | ApiErrorResponse
    ) {
        if ("error" in res && res.error) {
            AppFetch.processError(res);

            return Promise.reject(res);
        }

        return res as T;
    }

    private static processError(error: ApiErrorResponse) {
        let notification = ServerNotificationMap[error.reason];
        if (!notification) {
            console.error(error);
            notification = {
                title: "Неизвестная ошибка (С)",
                message: error.reason
            };
        }

        useNotificationsStore.getState().addNotification({
            ...notification,
            type: "error"
        });
    }
}
