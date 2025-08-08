import { Vector } from '../util/vector'
import { CanvasStorage } from './canvas'

export class Viewport {
  static scale = 1.2
  static x: number = 0
  static y: number = 0

  static renderScale = 1.2
  static renderX = 0
  static renderY = 0

  static minScale = 0
  static maxScale = 0

  static locked = false

  static worldWidth = 0
  static worldHeight = 0
  static get worldScreenWidth() {
    return this.screenWidth / this.scale
  }
  static get worldScreenHeight() {
    return this.screenHeight / this.scale
  }
  static screenWidth = 0
  static screenHeight = 0

  static minWidth = 0
  static maxWidth = 0
  static minHeight = 0
  static maxHeight = 0

  static scaleVelocity = 0
  static xVelocity = 0
  static yVelocity = 0

  static processCanvas(size: Vector) {
    Viewport.screenWidth = window.innerWidth
    Viewport.screenHeight = window.innerHeight
    Viewport.worldWidth = window.innerWidth * 2
    Viewport.worldHeight = window.innerHeight * 2

    Viewport.fit(size)
    Viewport.zoomPercent(-0.25)
    Viewport.minWidth = Viewport.worldWidth / 500
    Viewport.minHeight = Viewport.worldHeight / 500
    Viewport.maxWidth = size.x * 5
    Viewport.maxHeight = size.y * 5
    Viewport.moveCenter(new Vector(size.x / 2, size.y / 2))
  }

  static focusOn(point: Vector, size: Vector) {
    const center = new Vector(point.x + size.x / 2, point.y + size.y / 2)
    this.fit(new Vector(size.x, size.y + 20))
    this.moveCenter(center)
  }

  static smoothMove(delta: number) {
    // const deltaTime = Math.min(delta, 100) / 16

    // this.renderScale += (this.scale - this.renderScale) * 0.1 * deltaTime
    // this.renderX += (this.x - this.renderX) * 0.1 * deltaTime
    // this.renderY += (this.y - this.renderY) * 0.1 * deltaTime
    this.renderScale = this.scale
    this.renderX = this.x
    this.renderY = this.y
  }

  static boundToCanvas(point: Vector): Vector {
    const width = CanvasStorage.width
    const height = CanvasStorage.height
    if (point.x < 0) point.x = 0
    if (point.x > width - 1) point.x = width - 1
    if (point.y < 0) point.y = 0
    if (point.y > height - 1) point.y = height - 1
    return point
  }

  static clampZoom() {
    const width = this.worldScreenWidth
    const height = this.worldScreenHeight
    if (width < this.minWidth) {
      const targetScale = this.screenWidth / this.minWidth
      this.scale += (targetScale - this.scale) * 0.05
    }
    if (width > this.maxWidth) {
      const targetScale = this.screenWidth / this.maxWidth
      this.scale += (targetScale - this.scale) * 0.05
    }
    if (height < this.minHeight) {
      const targetScale = this.screenHeight / this.minHeight
      this.scale += (targetScale - this.scale) * 0.05
    }
    if (height > this.maxHeight) {
      const targetScale = this.screenHeight / this.maxHeight
      this.scale += (targetScale - this.scale) * 0.05
    }
  }

  static fit(size: Vector) {
    const scaleX = this.screenWidth / size.x
    const scaleY = this.screenHeight / size.y
    this.scale = Math.min(scaleX, scaleY)
  }

  static zoomPercent(percent: number) {
    this.scale += (this.scale * percent - this.scale) * 0.1
  }

  static moveCenter(point: Vector) {
    this.x = this.worldScreenWidth / 2 - point.x
    this.y = this.worldScreenHeight / 2 - point.y
  }

  static toTranslation(x: number, y: number): [number, number] {
    return [
      (x + this.renderX) * this.renderScale,
      (y + this.renderY) * this.renderScale
    ]
  }

  static toScale(width: number, height: number): [number, number] {
    return [width * this.renderScale, height * this.renderScale]
  }

  static toLocal(x: number, y: number): Vector {
    return new Vector(
      x / Viewport.scale - Viewport.x,
      y / Viewport.scale - Viewport.y
    )
  }

  static toLocalFloor(ix: number, iy: number): Vector {
    const { x, y } = this.toLocal(ix, iy)
    return new Vector(Math.floor(x), Math.floor(y))
  }

  static checkPointInside(x: number, y: number) {
    if (
      x < 0 ||
      y < 0 ||
      x > CanvasStorage.width - 1 ||
      y > CanvasStorage.height - 1
    )
      return false
    return true
  }
}
