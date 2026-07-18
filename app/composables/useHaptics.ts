import { createSharedComposable, useVibrate } from '@vueuse/core'

/**
 * Physical feedback for the toy, shared app-wide.
 * Uses the Vibration API where available (Android Chrome, etc.)
 * and silently no-ops elsewhere (iOS Safari, desktop).
 */
export const useHaptics = createSharedComposable(() => {
  const { vibrate, isSupported, pattern } = useVibrate({ pattern: [] })

  function buzz(p: number | number[]) {
    if (!isSupported.value) return
    pattern.value = p
    vibrate()
  }

  return {
    isSupported,
    /** Tiny detent click while a knob turns */
    tick: () => buzz(3),
    /** Firmer bump when the stylus hits the edge of the screen */
    bump: () => buzz(14),
    /** Rattly rumble while the toy is shaken clean */
    rumble: () => buzz([22, 45, 22, 45, 30, 35, 45]),
  }
})
