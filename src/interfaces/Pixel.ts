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
        _id: string;
        username: string;
        role: UserRole;
    } | null;
    color: number;
    tag: {
        _id: string;
        name: string;
    } | null;
}
