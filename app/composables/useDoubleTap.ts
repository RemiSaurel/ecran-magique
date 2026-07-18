export interface DoubleTapPoint {
  clientX: number
  clientY: number
}

type DoubleTapEvent = MouseEvent | TouchEvent

/**
 * Unified "double activation" gesture: native dblclick covers mice, while
 * double-tap is detected manually — dblclick doesn't fire on most mobile
 * browsers, where the gesture is otherwise hijacked for zooming.
 *
 * Extra args are passed through to the handler so it can be used inside v-for:
 * `@touchend="onTouchEnd($event, item)"`.
 */
export function useDoubleTap<T extends unknown[] = []>(
  handler: (point: DoubleTapPoint, event: DoubleTapEvent, ...args: T) => void,
  delay = 350,
) {
  let lastTapAt = 0
  let lastTapTarget: EventTarget | null = null
  let lastTouchFireAt = 0

  function onDoubleClick(event: MouseEvent, ...args: T) {
    // Ignore the dblclick some mobile browsers synthesize after a double-tap.
    if (Date.now() - lastTouchFireAt < 500) return
    handler(event, event, ...args)
  }

  function onTouchEnd(event: TouchEvent, ...args: T) {
    const touch = event.changedTouches[0]
    if (!touch) return
    const now = Date.now()
    if (event.target === lastTapTarget && now - lastTapAt < delay) {
      lastTapAt = 0
      lastTapTarget = null
      lastTouchFireAt = now
      // Stop double-tap zoom and the synthesized dblclick.
      event.preventDefault()
      handler(touch, event, ...args)
    }
    else {
      lastTapAt = now
      lastTapTarget = event.target
    }
  }

  return { onDoubleClick, onTouchEnd }
}
