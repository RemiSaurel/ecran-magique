import { useEventListener } from '@vueuse/core'

const KEY_STEP = 8 // degrees per keydown tick

/**
 * Global keyboard controls: arrow keys turn the knobs, space shakes.
 * Listener cleanup is handled by useEventListener.
 */
export function useEtchKeyboard(controls: {
  turnX: (degrees: number) => void
  turnY: (degrees: number) => void
  shake: () => void
}) {
  useEventListener('keydown', (e: KeyboardEvent) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return
    // don't steal keys while typing (e.g. naming a sketch in the share dialog)
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
    switch (e.key || e.code) {
      case 'ArrowLeft': controls.turnX(-KEY_STEP); break
      case 'ArrowRight': controls.turnX(KEY_STEP); break
      case 'ArrowUp': controls.turnY(-KEY_STEP); break
      case 'ArrowDown': controls.turnY(KEY_STEP); break
      case ' ': case 'Space': controls.shake(); break
      default: return
    }
    e.preventDefault()
  })
}
