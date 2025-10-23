import { Point } from "pixi.js";
import { AppColor } from "./AppColor";

export enum ImageFormat {
    RGB = 3,
    RGBA = 4
}

export class AppImage {
    public readonly size: Point;
    public readonly canvas = document.createElement("canvas");
    private readonly ctx = this.canvas.getContext("2d")!;

    private constructor(
        private readonly bufferPixelDataSize: ImageFormat = ImageFormat.RGBA,
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

    public static async create(
        blob: Blob | HTMLImageElement,
        format?: ImageFormat
    ): Promise<AppImage> {
        const bitmap = await createImageBitmap(blob);

        const instance = new AppImage(format, bitmap);
        return instance;
    }

    public static async fromBlob(blob: Blob, format?: ImageFormat) {
        const bitmap = await createImageBitmap(blob);

        const instance = new AppImage(format, bitmap, blob);
        return instance;
    }

    public static fromImage(image: HTMLImageElement) {
        const instance = new AppImage(ImageFormat.RGBA, image);
        return instance;
    }

    public static async fromURL(
        url: string,
        format: ImageFormat
    ): Promise<AppImage> {
        const response = await fetch(url);
        const blob = await response.blob();
        return this.create(blob, format);
    }

    public static async fromCanvas(
        canvas: HTMLCanvasElement,
        format: ImageFormat
    ): Promise<AppImage> {
        const blob = await new Promise<Blob>((resolve) => {
            canvas.toBlob((blob) => resolve(blob!));
        });
        return this.create(blob, format);
    }

    public getPixel(point: Point): AppColor {
        if (!this.buffer || !this.size) throw new Error("Image not processed");

        const index = point.x + point.y * this.size.x;
        const [r, g, b, ...rest] = this.buffer.slice(
            index * this.bufferPixelDataSize,
            index * this.bufferPixelDataSize + this.bufferPixelDataSize
        );

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
