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

    private convertRGBAtoRGB(DATA_RGBA: Uint8ClampedArray, { x, y }: Point) {
        const DATA_RGB = new Uint8ClampedArray(x * y * ImageFormat.RGB);
        for (let i = 0, j = 0; i < DATA_RGBA.length; i += 4, j += 3) {
            DATA_RGB[j] = DATA_RGBA[i];
            DATA_RGB[j + 1] = DATA_RGBA[i + 1];
            DATA_RGB[j + 2] = DATA_RGBA[i + 2];
        }
        return DATA_RGB;
    }

    private convertRGBtoRGBA(DATA_RGB: Uint8ClampedArray, { x, y }: Point) {
        const DATA_RGBA = new Uint8ClampedArray(x * y * ImageFormat.RGBA);
        for (let i = 0, j = 0; i < DATA_RGB.length; i += 3, j += 4) {
            DATA_RGBA[j] = DATA_RGB[i];
            DATA_RGBA[j + 1] = DATA_RGB[i + 1];
            DATA_RGBA[j + 2] = DATA_RGB[i + 2];
            DATA_RGBA[j + 3] = 255;
        }
        return DATA_RGBA;
    }

    /*async process() {
        this.canvas.width = bitmap.width;
        this.canvas.height = bitmap.height;
        this.ctx.drawImage(bitmap, 0, 0);

        const imageData = this.ctx.getImageData(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        ).data;

        this.size = new Point(bitmap.width, bitmap.height);

        if (
            imageData.length !== this.size.x * this.size.y * ImageFormat.RGBA &&
            this.bufferPixelDataSize === ImageFormat.RGBA
        ) {
            this.buffer = this.convertRGBtoRGBA(imageData, this.size);
        } else if (
            imageData.length !== this.size.x * this.size.y * ImageFormat.RGB &&
            this.bufferPixelDataSize === ImageFormat.RGB
        ) {
            this.buffer = this.convertRGBAtoRGB(imageData, this.size);
        } else {
            this.buffer = imageData;
        }

        return this;
    }*/

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
