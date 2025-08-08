import { WebGlGraphics } from './webgl'

export * from './types'

export const makeGraphics = (
  canvas: HTMLCanvasElement
): GraphicsRender<any> => {
  //   if (navigator.gpu) {
  //   }
  //   if (!!canvas.getContext('webgl2')) {
  //   }
  return new WebGlGraphics(canvas)
}
