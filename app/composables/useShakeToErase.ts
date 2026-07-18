import { useDeviceMotion } from '@vueuse/core'
import { animate, useMotionValue, useReducedMotion } from 'motion-v'

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Everything "shake": the rattle animation + dust overlay, and the two
 * physical triggers — shaking the dragged toy back and forth, and shaking
 * the actual phone (Android fires devicemotion freely; iOS needs a permission
 * prompt, so it stays inert there and the button/space/drag paths cover it).
 */
export function useShakeToErase(erase: () => void) {
  const haptics = useHaptics()
  const sounds = useToySounds()
  const prefersReduced = useReducedMotion()

  const overlayOpacity = useMotionValue(0)
  const shakeX = useMotionValue(0)
  const shakeY = useMotionValue(0)
  const shakeRotate = useMotionValue(0)
  const isShaking = ref(false)

  function animateTo(mv: ReturnType<typeof useMotionValue<number>>, keyframes: number[], duration: number) {
    return new Promise<void>((resolve) => {
      animate(mv, keyframes, { duration, ease: 'easeInOut', onComplete: () => resolve() })
    })
  }

  async function shake() {
    if (isShaking.value) return
    isShaking.value = true
    haptics.rumble()
    sounds.rattle()

    // Aluminium dust rises and coats the screen while the toy rattles
    animateTo(overlayOpacity, [overlayOpacity.get(), 0.55, 0.4, 0.75, 0.6, 1], 0.7)

    if (prefersReduced) {
      await wait(700)
    } else {
      animateTo(shakeRotate, [0, -2.4, 2.1, -1.7, 1.3, -0.7, 0], 0.7)
      animateTo(shakeY, [0, 8, -7, 7, -5, 3, 0], 0.7)
      await animateTo(shakeX, [0, -14, 13, -11, 8, -4, 0], 0.7)
    }

    erase()
    animate(overlayOpacity, 0, {
      duration: 0.5,
      ease: 'easeOut',
      onComplete: () => { isShaking.value = false },
    })
  }

  // Grab the whole toy and shake it back and forth fast enough → it erases
  let lastVelocitySign = 0
  let reversals = 0
  let erasedThisDrag = false

  function onDeviceDrag(_event: unknown, info?: { velocity?: { x: number } }) {
    const vx = info?.velocity?.x ?? 0
    if (Math.abs(vx) < 800) return
    const sign = Math.sign(vx)
    if (lastVelocitySign !== 0 && sign !== lastVelocitySign) {
      reversals += 1
      if (reversals >= 2 && !erasedThisDrag) {
        erasedThisDrag = true
        shake()
      }
    }
    lastVelocitySign = sign
  }

  function onDeviceDragEnd() {
    lastVelocitySign = 0
    reversals = 0
    erasedThisDrag = false
  }

  // Physically shake the phone → erase, like the real toy
  const { acceleration } = useDeviceMotion()
  let spikes = 0
  let lastSpikeAt = 0

  watch(acceleration, (a) => {
    if (!a) return
    const magnitude = Math.hypot(a.x ?? 0, a.y ?? 0, a.z ?? 0)
    if (magnitude < 16) return
    const now = performance.now()
    if (now - lastSpikeAt > 900) spikes = 0
    if (now - lastSpikeAt > 120) {
      spikes += 1
      lastSpikeAt = now
    }
    if (spikes >= 3) {
      spikes = 0
      shake()
    }
  })

  return { overlayOpacity, shakeX, shakeY, shakeRotate, isShaking, shake, onDeviceDrag, onDeviceDragEnd }
}
