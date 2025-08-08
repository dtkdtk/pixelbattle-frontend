import { BufferInfo } from 'twgl.js'
import { Vector } from '../util/vector'
import Color from '../util/сolor'
import { IconsType } from './webgl'

export interface Texture {
  src: WebGLTexture
  width: number
  height: number
}

export interface GenericGraphics<ImageType> {
  clear(): void
  rectangle(pos: Vector, size: Vector, color: Color, alpha: number): void
  roundedRectangle(
    pos: Vector,
    size: Vector,
    color: Color,
    borderRadius: number,
    alpha: number
  ): void
  loadImage(src: ImageData): ImageType
  image(pos: Vector, src: ImageType, alpha: number): void
  icon(
    pos: Vector,
    size: Vector,
    color: Color,
    type: IconsType,
    alpha: number
  ): void
  verities(
    pos: Vector,
    size: Vector,
    color: Color,
    verities: BufferInfo,
    alpha: number
  ): void
  loadVerities(vertices: Float32Array): BufferInfo
}

export type WebGLGraphics = GenericGraphics<WebGLImage>
export type CtxGraphics = GenericGraphics<ImageBitmap>
export type Graphics = GenericGraphics<any>

export interface WebGLImage {
  texture: WebGLTexture
  size: Vector
}
