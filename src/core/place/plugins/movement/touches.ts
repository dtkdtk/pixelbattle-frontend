import { Viewport } from 'src/core/storage'
import { Vector } from '../../../util/vector'
import {
  useTouchCancel,
  useTouchEnd,
  useTouchMove,
  useTouchStart
} from '../../utils/movement/primitive'

export const touchScreenPlugin = () => {
  let last: Touch | null = null
  let moved = false
  let isDragging = false

  let initialDistance = 0
  let initialScale = 0
  let initialCenterScreen: Vector | null = null
  let initialCenterLocal: Vector | null = null

  useTouchStart((event) => {
    const touches = event.touches

    if (touches.length === 2) {
      const first = touches[0]
      const second = touches[1]

      initialDistance = Math.hypot(
        second.clientX - first.clientX,
        second.clientY - first.clientY
      )

      initialScale = Viewport.scale

      initialCenterScreen = new Vector(
        (first.clientX + second.clientX) / 2,
        (first.clientY + second.clientY) / 2
      )
      initialCenterLocal = Viewport.toLocal(
        initialCenterScreen.x,
        initialCenterScreen.y
      )

      isDragging = false
    } else if (touches.length === 1) {
      isDragging = true
    }
  })

  const resetState = () => {
    last = null
    moved = false
    isDragging = false
    initialDistance = 0
    initialCenterScreen = null
    initialCenterLocal = null
  }

  useTouchCancel(resetState)
  useTouchEnd(resetState)

  let velocityX = 0
  let velocityY = 0
  const smoothing = 0.8

  useTouchMove((event) => {
    event.preventDefault()
    const touches = event.touches

    if (touches.length === 1 && isDragging) {
      const touch = touches[0]
      const newPoint = Viewport.toLocal(touch.clientX, touch.clientY)

      if (last) {
        const lastPos = Viewport.toLocal(last.clientX, last.clientY)
        const distX = newPoint.x - lastPos.x
        const distY = newPoint.y - lastPos.y

        if (!moved && (Math.abs(distX) > 5 || Math.abs(distY) > 5)) {
          moved = true
        }

        if (moved) {
          velocityX = velocityX * (1 - smoothing) + distX * smoothing
          velocityY = velocityY * (1 - smoothing) + distY * smoothing

          Viewport.x += velocityX
          Viewport.y += velocityY
        }
      }
      last = touch
    } else if (touches.length === 2) {
      const first = touches[0]
      const second = touches[1]

      const currentDistance = Math.hypot(
        second.clientX - first.clientX,
        second.clientY - first.clientY
      )

      const scaleChange = currentDistance / initialDistance
      Viewport.scale = initialScale * scaleChange
      Viewport.clampZoom()

      const centerNow = new Vector(
        (first.clientX + second.clientX) / 2,
        (first.clientY + second.clientY) / 2
      )

      if (initialCenterLocal) {
        const newCenterLocal = Viewport.toLocal(centerNow.x, centerNow.y)
        Viewport.x += newCenterLocal.x - initialCenterLocal.x
        Viewport.y += newCenterLocal.y - initialCenterLocal.y
      }
    }
  })
}
