export interface ProfileInfo {
    id: string;
    username: string;
    tag: string | null;
    role: UserRole;
    karma: number;
    banned: BanInfo | null;
    cooldown: number;
    connections: {
        discord?: {
            visible: boolean;
            username: string;
            id: string;
        };
    };
}

export enum UserRole {
    User = 0,
    RESERVED = 1,
    Moderator = 2,
    Admin = 3,
    Developer = 4
}

export interface BanInfo {
    moderatorID: string;
    timeout: number;
    reason: string | null;
}
