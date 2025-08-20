import { GlDeprecatedBrowserError, GlShaderBuildError } from '../util/errors'

// Shaders
import shader from './glsl/shader.glsl'
import icons from './glsl/icons.glsl'
import { Viewport } from '../storage'
import Color from '../util/color'
import { ErrorDaemon } from '../daemons/error'
import { WebGLGraphics, WebGLImage } from './types'
import { Vector } from '../util/vector'
import {
  ProgramInfo,
  BufferInfo,
  createProgramInfo,
  createBufferInfoFromArrays,
  setDefaults,
  createTexture,
  setBuffersAndAttributes,
  setUniforms,
  drawBufferInfo
} from 'twgl.js'

export enum IconsType {
  CROSS = 'cross',
  PLUS = 'plus',
  ARROW_LEFT = 'arrow_left',
  ARROW_RIGHT = 'arrow_right',
  OUTLINE = 'outline'
}

export enum AmbientEffectType {
  SPRING = 'spring_ambient'
}

export const shaders: Record<string, [string, string, boolean?]> = {
  image: [shader, 'IMAGE'],
  rect: [shader, 'RECT'],
  button: [shader, 'BUTTON'],
  outline: [shader, 'OUTLINE'],
  plus: [icons, 'PLUS'],
  cross: [icons, 'CROSS'],
  arrow_left: [icons, 'ARROW_LEFT'],
  arrow_right: [icons, 'ARROW_RIGHT']
}

export class WebGlGraphics implements WebGLGraphics {
  gl: WebGLRenderingContext
  private programs: Record<keyof typeof shaders, ProgramInfo> = {}
  private buffers: { [key: string]: BufferInfo } = {}

  constructor(canvas: HTMLCanvasElement) {
    const gl = canvas.getContext('webgl')
    if (!gl) {
      ErrorDaemon.setError(new GlDeprecatedBrowserError())
      throw new Error('Your browser does not support WebGL')
    }
    this.gl = gl

    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

    for (const i in shaders) {
      this.programs[i] = createProgramInfo(
        gl,
        [
          shaders[i][2]
            ? '#define VERTEX_SHADER\n' + shaders[i][0]
            : '#define VERTEX_SHADER\n' + shader,
          `#define ${shaders[i][1]}\n` + shaders[i][0]
        ],
        (msg, lineOffset) =>
          ErrorDaemon.setError(new GlShaderBuildError(msg, i, lineOffset))
      )
    }

    this.buffers['quad'] = createBufferInfoFromArrays(gl, {
      position: {
        numComponents: 2,
        data: [0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]
      },
      texcoord: {
        numComponents: 2,
        data: [0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]
      }
    })

    setDefaults({
      attribPrefix: 'a_'
    })
  }

  private program: string | null = null

  private setProgram(program: string) {
    if (this.program != program) {
      this.gl.useProgram(this.programs[program].program)
      this.program = program
    }
  }

  clear() {
    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height)
    this.gl.clearColor(0.156, 0.156, 0.156, 1)
    this.gl.clear(this.gl.COLOR_BUFFER_BIT)
  }

  loadImage(src: ImageData): WebGLImage {
    const gl = this.gl
    return {
      texture: createTexture(gl, {
        src: src.data,
        width: src.width,
        height: src.height,
        format: gl.RGBA,
        min: gl.LINEAR,
        mag: gl.NEAREST,
        wrap: gl.CLAMP_TO_EDGE
      }),
      size: new Vector(src.width, src.height)
    }
  }

  image(pos: Vector, src: WebGLImage, alpha: number = 1) {
    const gl = this.gl

    const uniforms = {
      u_resolution: [gl.canvas.width, gl.canvas.height],
      u_translation: Viewport.toTranslation(pos.x, pos.y),
      u_scale: Viewport.toScale(src.size.x, src.size.y),
      u_image: src.texture,
      u_alpha: alpha
    }

    this.setProgram('image')
    setBuffersAndAttributes(gl, this.programs['image'], this.buffers['quad'])
    setUniforms(this.programs['image'], uniforms)
    drawBufferInfo(gl, this.buffers['quad'])
  }

  rectangle(pos: Vector, size: Vector, color: Color, alpha = 1) {
    const gl = this.gl

    const uniforms = {
      u_resolution: [gl.canvas.width, gl.canvas.height],
      u_translation: Viewport.toTranslation(pos.x, pos.y),
      u_scale: Viewport.toScale(size.x, size.y),
      u_color: color.toGl(),
      u_alpha: alpha
    }

    this.setProgram('rect')
    setBuffersAndAttributes(gl, this.programs['rect'], this.buffers['quad'])
    setUniforms(this.programs['rect'], uniforms)
    drawBufferInfo(gl, this.buffers['quad'])
  }

  loadVerities(vertices: Float32Array): BufferInfo {
    return createBufferInfoFromArrays(this.gl, {
      position: {
        numComponents: 2,
        data: vertices
      }
    })
  }

  verities(
    pos: Vector,
    size: Vector,
    color: Color,
    verities: BufferInfo,
    alpha = 1
  ) {
    const gl = this.gl

    const uniforms = {
      u_resolution: [gl.canvas.width, gl.canvas.height],
      u_translation: Viewport.toTranslation(pos.x, pos.y),
      u_scale: Viewport.toScale(size.x, size.y),
      u_color: color.toGl(),
      u_alpha: alpha
    }

    this.setProgram('rect')
    setBuffersAndAttributes(gl, this.programs['rect'], verities)
    setUniforms(this.programs['rect'], uniforms)
    drawBufferInfo(gl, verities)
  }

  icon(pos: Vector, size: Vector, color: Color, type: IconsType, alpha = 1) {
    const gl = this.gl

    const uniforms = {
      u_resolution: [gl.canvas.width, gl.canvas.height],
      u_translation: Viewport.toTranslation(pos.x, pos.y),
      u_scale: Viewport.toScale(size.x, size.y),
      u_color: color.toGl(),
      u_alpha: alpha
    }

    this.setProgram(type)
    setBuffersAndAttributes(gl, this.programs[type], this.buffers['quad'])
    setUniforms(this.programs[type], uniforms)
    drawBufferInfo(gl, this.buffers['quad'])
  }

  roundedRectangle(
    pos: Vector,
    size: Vector,
    color: Color,
    borderRadius: number,
    alpha = 1
  ) {
    const gl = this.gl

    const uniforms = {
      u_resolution: [gl.canvas.width, gl.canvas.height],
      u_translation: Viewport.toTranslation(pos.x, pos.y),
      u_scale: Viewport.toScale(size.x, size.y),
      u_color: color.toGl(),
      u_alpha: alpha,
      u_border_radius: borderRadius,
      u_size: [size.x, size.y]
    }

    this.setProgram('button')
    setBuffersAndAttributes(gl, this.programs['button'], this.buffers['quad'])
    setUniforms(this.programs['button'], uniforms)
    drawBufferInfo(gl, this.buffers['quad'])
  }
}
