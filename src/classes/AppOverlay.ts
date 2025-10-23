import { Point } from "pixi.js";
import { AppImage } from "./AppImage";
import { AppColor } from "./AppColor";
import { stringToBlob, type StoredOverlay } from "@stores";

export class AppOverlay {
    image: AppImage;
    position: Point;
    opacity: number;
    imageName: string;
    blob: string = "";

    constructor(
        image: AppImage,
        imageName: string,
        position: Point,
        blobStr: string,
        opacity?: number
    ) {
        this.image = image;
        this.imageName = imageName;
        this.position = position;
        this.opacity = opacity ?? 100;
        this.blob = blobStr;
    }

    getPixel(pixel: Point, base: AppColor): AppColor {
        const added = this.image.getPixel(pixel);

        const outR = added.red * added.alpha + base.red * (1 - added.alpha);
        const outG = added.green * added.alpha + base.green * (1 - added.alpha);
        const outB = added.blue * added.alpha + base.blue * (1 - added.alpha);
        const outA = 1;

        return new AppColor([outR, outG, outB, outA]);
    }

    public static async fromJSON(v: StoredOverlay) {
        const blob = await stringToBlob(v.blob);
        const image = await AppImage.fromBlob(blob);

        return new AppOverlay(
            image,
            v.imageName,
            new Point(v.position.x, v.position.y),
            v.blob,
            v.opacity
        );
    }

    toJSON(): StoredOverlay {
        return {
            imageName: this.imageName,
            position: this.position,
            opacity: this.opacity,
            blob: this.blob
        };
    }
}
