/**
 * General primitive to transform of color.
 */
export default class Color {
  public color: number = 0
  public arr: number[] = []

  /**
   * @param color HEX Color
   */
  constructor(color?: string | number | number[]) {
    if (typeof color === 'string') {
      color = color.substring(1)
      this.color = Number.parseInt(color, 16)
      this.arr = this.toArray()
    } else if (Array.isArray(color)) {
      this.color = this.fromArray(color)
      this.arr = color
    } else {
      this.color = color ?? 0
      this.arr = this.toArray()
    }
  }

  private toArray() {
    return [this.color >> 16, (this.color >> 8) & 0xff, this.color & 0xff]
  }

  private fromArray([r, g, b]: number[]) {
    return (r << 16) | (g << 8) | b
  }

  /**
   * converts color to rgb format
   * @returns RGB string
   */
  toRGB() {
    return `rgb(${this.arr[0]}, ${this.arr[1]}, ${this.arr[2]})`
  }

  /**
   * converts color to hex format
   * @returns HEX string
   */
  toHex() {
    return `#${this.elementToHex(this.arr[0])}${this.elementToHex(this.arr[1])}${this.elementToHex(this.arr[2])}`
  }

  /**
   * Converts part of a color list to part of a hexadecimal string.
   * @param c
   * @returns
   */
  private elementToHex(c: number) {
    const hex = c.toString(16)
    return hex.length == 1 ? '0' + hex : hex
  }

  /**
   * Checks that a color matches this color
   * @param c
   * @returns
   */
  equals(c: Color) {
    return !(
      this.arr[0] !== c.arr[0] ||
      this.arr[1] !== c.arr[1] ||
      this.arr[2] !== c.arr[2]
    )
  }

  /**
   * Transforms colors to Gl format
   * @returns color in array
   */
  toGl(): number[] {
    return [
      this.arr[0] / 255,
      this.arr[1] / 255,
      this.arr[2] / 255,
      this.arr[3] ? this.arr[3] : 1.0
    ]
  }

  private static blackColor = new Color('#000000')
  private static whiteColor = new Color('#ffffff')

  /**
   * gives a color inversion depending on the brightness of the color.
   * @returns Color
   */
  getReadableColor(): Color {
    const [red, green, blue] = this.arr

    // https://stackoverflow.com/questions/3942878/how-to-decide-font-color-in-white-or-black-depending-on-background-color/3943023#3943023
    const isBlack = red * 0.299 + green * 0.587 + blue * 0.114 > 186

    return isBlack ? Color.blackColor : Color.whiteColor
  }
}
