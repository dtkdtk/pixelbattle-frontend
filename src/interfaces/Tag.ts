export interface ApiTags {
    tags: ApiTag[];
    pixels: {
        all: number;
        used: number;
        unused: number;
    };
}

export type ApiTag = {
    id: string;
    name: string;
    count: number;
};

export interface FormatedTag {
    id: string;
    name: string;
    count: number;
    place: number;
}
