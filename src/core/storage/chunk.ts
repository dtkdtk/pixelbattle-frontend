import { Vector } from '../util/vector'
import Color from '../util/color'

export class CanvasChunk {
  pos: Vector
  size: Vector
  imageData: ImageData
  isUpdated = true
  lastUpdateTime = 0

  constructor(pos: Vector, image: ImageData, size: Vector) {
    this.pos = pos
    this.size = size
    this.imageData = image
  }

  itInside(x: number, y: number) {
    return (
      x >= this.pos.x &&
      y >= this.pos.y &&
      x <= this.pos.x + this.size.x - 1 &&
      y <= this.pos.y + this.size.y - 1
    )
  }

  putPixel(x: number, y: number, color: Color) {
    const pos = (x - this.pos.x + (y - this.pos.y) * this.size.x) * 4

    const data = this.imageData.data
    data[pos] = color.arr[0]
    data[pos + 1] = color.arr[1]
    data[pos + 2] = color.arr[2]
    Object.assign({ data }, this.imageData)

    this.isUpdated = true
  }

  getPixel(x: number, y: number) {
    const pos = (x - this.pos.x + (y - this.pos.y) * this.size.x) * 4

    const data = this.imageData.data
    return new Color([data[pos], data[pos + 1], data[pos + 2]])
  }
}
