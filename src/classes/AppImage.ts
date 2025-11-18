import { Point } from "pixi.js";
import { AppColor } from "./AppColor";

export class AppImage {
    public readonly size: Point;
    public readonly canvas = document.createElement("canvas");
    private readonly ctx = this.canvas.getContext("2d", {
        willReadFrequently: true
    })!;

    private constructor(
        image: ImageBitmap | HTMLImageElement,
        public readonly blob?: Blob
    ) {
        this.canvas.width = image.width;
        this.canvas.height = image.height;
        this.ctx.drawImage(image, 0, 0);
        this.size = new Point(image.width, image.height);
    }

    public get imageData() {
        return this.ctx.getImageData(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );
    }

    public get buffer(): Uint8ClampedArray {
        return this.imageData.data;
    }

    public static async fromBlob(blob: Blob) {
        const bitmap = await createImageBitmap(blob);

        const instance = new AppImage(bitmap, blob);
        return instance;
    }

    public static fromImage(image: HTMLImageElement) {
        const instance = new AppImage(image);
        return instance;
    }

    public static async fromURL(url: string): Promise<AppImage> {
        const response = await fetch(url);
        const blob = await response.blob();
        return this.fromBlob(blob);
    }

    public static async fromCanvas(
        canvas: HTMLCanvasElement
    ): Promise<AppImage> {
        const blob = await new Promise<Blob>((resolve) => {
            canvas.toBlob((blob) => resolve(blob!));
        });
        return this.fromBlob(blob);
    }

    public getPixel(point: Point): AppColor {
        if (!this.buffer || !this.size) throw new Error("Image not processed");

        const index = point.x + point.y * this.size.x;
        const [r, g, b, ...rest] = this.buffer.slice(index * 4, index * 4 + 4);

        return new AppColor(
            new Uint8Array([r, g, b, rest.length === 0 ? 255 : rest[0]])
        );
    }

    public setPixel(point: Point, color: AppColor): void {
        if (!this.imageData || !this.size)
            throw new Error("Image not processed");

        const [r, g, b] = color.toUint8RgbArray();

        const pixel = this.ctx.createImageData(1, 1);

        pixel.data[0] = r;
        pixel.data[1] = g;
        pixel.data[2] = b;
        pixel.data[3] = 255;

        this.ctx.putImageData(pixel, point.x, point.y);
        this.canvas.dispatchEvent(
            new Event("update", { bubbles: false, cancelable: false })
        );
    }
}
