import { useEventListener } from '@vueuse/core'
import { SCREEN_W } from '~/utils/etch'

/** Logical px of stylus travel per wheel-delta unit */
const WHEEL_FACTOR = 0.45

/**
 * Drawing directly on the screen: finger/mouse drag and two-finger trackpad
 * pan. Reports deltas in logical canvas px via `onDraw`. Move/up listeners
 * live on the window so a stroke can never be swallowed by the whole-toy
 * drag or by leaving the screen mid-stroke.
 */
export function useScreenSketch(onDraw: (dx: number, dy: number) => void) {
  const screenRef = ref<HTMLElement>()
  let sketching = false
  let lastPointer = { x: 0, y: 0 }

  function onScreenPointerDown(e: PointerEvent) {
    sketching = true
    lastPointer = { x: e.clientX, y: e.clientY }
    e.stopPropagation()
    e.preventDefault()
  }

  useEventListener('pointermove', (e: PointerEvent) => {
    if (!sketching || !screenRef.value) return
    const scale = SCREEN_W / screenRef.value.getBoundingClientRect().width
    const dx = (e.clientX - lastPointer.x) * scale
    const dy = (e.clientY - lastPointer.y) * scale
    lastPointer = { x: e.clientX, y: e.clientY }
    onDraw(dx, dy)
  })
  useEventListener('pointerup', () => { sketching = false })
  useEventListener('pointercancel', () => { sketching = false })

  function onScreenWheel(e: WheelEvent) {
    onDraw(e.deltaX * WHEEL_FACTOR, e.deltaY * WHEEL_FACTOR)
  }

  return { screenRef, onScreenPointerDown, onScreenWheel }
}
