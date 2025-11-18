import { UserRole } from "./Profile";

export interface ApiPixel {
    color: string;
    x: number;
    y: number;
}

export interface PixelInfo {
    x: number;
    y: number;
    author: {
        id: string;
        username: string;
        role: UserRole;
    } | null;
    color: number;
    tag: {
        id: string;
        name: string;
    } | null;
}
