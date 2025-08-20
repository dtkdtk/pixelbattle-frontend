import { OverlaysDaemon } from 'src/core/daemons/overlays'
import { PaletteDaemon } from 'src/core/daemons/palette'
import { useClick } from '../utils/movement/useClick'
import { ToolsDaemon } from 'src/core/daemons/tools'
import { useRender } from '../utils/render/primitive'
import { usePress } from '../utils/movement/usePress'
import { GuiDaemon } from 'src/core/daemons/gui'
import { Overlay } from 'src/core/util/overlay'
import { Vector } from 'src/core/util/vector'
import { Texture } from 'src/core/graphics'

export const overlaysPlugin = () => {
  overlaysMovementPlugin()
  overlaysRenderPlugin()
}

const overlaysMovementPlugin = () => {
  const processForImage = (x: number, y: number, image: Overlay) => {
    if (image.checkPointInside(x, y)) {
      const color = image.getPixel(x, y)
      if (color && color.arr[3] !== 0) {
        PaletteDaemon.addAndSelect(color)
        return true
      }
    }
    return false
  }

  const overlayPickHandler = (x: number, y: number) => {
    if (OverlaysDaemon.state.viewMode === 0)
      return processForImage(x, y, OverlaysDaemon.currentOverlay)
    else if (OverlaysDaemon.state.viewMode === 1)
      for (let i = 0; i < OverlaysDaemon.state.overlays.length; i++)
        if (processForImage(x, y, OverlaysDaemon.state.overlays[i])) return true
  }

  usePress(
    ({ x, y }) => {
      GuiDaemon.setCurrent(0)
      OverlaysDaemon.setOverlayAtPoint(new Vector(x, y))
      GuiDaemon.container!.elements[0].handlePointerDown({ x, y })
    },
    1000,
    ({ x, y }) => [
      !OverlaysDaemon.empty,
      checkPointInsideOverlays(x, y),
      !OverlaysDaemon.state.gui
    ]
  )

  // usePressMove(
  //   ({ x, y }) => {
  //     const currentOverlay = OverlaysDaemon.currentOverlay
  //     startPoint.x = x - currentOverlay.x
  //     startPoint.y = y - currentOverlay.y
  //   },
  //   ({ x, y }) => {
  //     OverlaysDaemon.setOverlayPosition(x - startPoint.x, y - startPoint.y)
  //   },
  //   () => {},
  //   ({ x, y }) => [checkPointInsideSelected(x, y)]
  // )

  useClick(
    'end',
    ({ x, y }) => {
      ToolsDaemon.togglePicker()
      return overlayPickHandler(x, y)
    },
    ({ x, y }) => [
      ToolsDaemon.state.pickerIsEnabled,
      !OverlaysDaemon.empty,
      checkPointInsideOverlays(x, y)
    ]
  )

  useClick(
    'end',
    ({ x, y, button }) => {
      if (button && button === 2) {
        return overlayPickHandler(x, y)
      }
      return false
    },
    ({ x, y }) => [!OverlaysDaemon.empty, checkPointInsideOverlays(x, y)]
  )
}

const overlaysRenderPlugin = () => {
  let textures: (Texture | null)[] = []

  useRender(
    ({ graphics }) => {
      const state = OverlaysDaemon.state

      if (state.viewMode === 1) {
        for (let i = 0; i < state.overlays.length; i++) {
          const image = state.overlays[i]

          if (image.raw != null) {
            if (textures[i] === undefined || textures[i] === null) {
              textures[i] = graphics.loadImage(image.raw)
            }

            if (textures[i]) {
              graphics.image(image.pos, textures[i], image.opacity / 100)
            }
          } else {
            textures[i] = null
          }
        }

        if (textures.length > state.overlays.length) {
          textures.length = state.overlays.length
        }
      } else if (state.viewMode === 0 && OverlaysDaemon.currentOverlay) {
        const image = OverlaysDaemon.currentOverlay
        if (image.raw) {
          let texture: Texture | null = null

          texture = graphics.loadImage(image.raw)

          if (texture) {
            graphics.image(image.pos, texture, image.opacity / 100)
          }
        }
      }
    },
    () => [!OverlaysDaemon.empty]
  )
}

const checkPointInsideOverlays = (x: number, y: number): boolean => {
  if (OverlaysDaemon.state.viewMode === 0 && OverlaysDaemon.currentOverlay)
    return OverlaysDaemon.currentOverlay.checkPointInside(x, y)
  else if (OverlaysDaemon.state.viewMode === 1)
    for (let i = 0; i < OverlaysDaemon.state.overlays.length; i++)
      if (
        OverlaysDaemon.state.overlays[i].checkPointInside(x, y) &&
        OverlaysDaemon.state.overlays[i].getPixel(x, y)?.arr[3] !== 0
      )
        return true
  return false
}
