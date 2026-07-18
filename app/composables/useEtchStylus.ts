import { animate, useMotionValue, useSpring, useTransform } from 'motion-v'
import { ETCH_PALETTE, KNOB_SENSITIVITY, SCREEN_H, SCREEN_MARGIN, SCREEN_W, STROKE_SIZES } from '~/utils/etch'

export type Axis = 'x' | 'y'

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

/**
 * The drawing machinery: canvas lifecycle, the spring-chased stylus, stroke
 * style, edge feedback (haptic + sound + dot pulse) and the GPU-friendly
 * transforms for the stylus dot.
 */
export function useEtchStylus() {
  const haptics = useHaptics()
  const sounds = useToySounds()

  const canvasRef = ref<HTMLCanvasElement>()
  let ctx: CanvasRenderingContext2D | null = null

  const strokeColor = ref(ETCH_PALETTE[0]!)
  const strokeWidth = ref(STROKE_SIZES[1]!)
  // The stylus dot grows with the stroke so you always see what you'll draw
  const dotSize = computed(() => `${Math.max(5, strokeWidth.value * 2)}px`)

  const x = useMotionValue(SCREEN_W / 2)
  const y = useMotionValue(SCREEN_H / 2)
  // The stylus chases the knobs with a touch of spring, like the real pulley mechanism
  const springX = useSpring(x, { stiffness: 550, damping: 42 })
  const springY = useSpring(y, { stiffness: 550, damping: 42 })

  let last = { x: SCREEN_W / 2, y: SCREEN_H / 2 }
  let rafId = 0

  function drawSegment() {
    rafId = 0
    if (!ctx) return
    const nx = springX.get()
    const ny = springY.get()
    ctx.strokeStyle = strokeColor.value
    ctx.lineWidth = strokeWidth.value
    ctx.beginPath()
    ctx.moveTo(last.x, last.y)
    ctx.lineTo(nx, ny)
    ctx.stroke()
    last = { x: nx, y: ny }
  }

  function scheduleDraw() {
    if (!rafId) rafId = requestAnimationFrame(drawSegment)
  }

  onMounted(() => {
    const canvas = canvasRef.value!
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = SCREEN_W * dpr
    canvas.height = SCREEN_H * dpr
    ctx = canvas.getContext('2d')!
    ctx.scale(dpr, dpr)
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    springX.on('change', scheduleDraw)
    springY.on('change', scheduleDraw)
  })

  onUnmounted(() => {
    if (rafId) cancelAnimationFrame(rafId)
  })

  // Stylus position indicator. A full-size layer translated by percentages of
  // its own size — a pure `transform` string, so it composites on the GPU
  // instead of thrashing layout with left/top updates every frame.
  const dotScale = useMotionValue(1)
  const dotLayerTransform = useTransform(
    [springX, springY],
    ([sx, sy]: number[]) => `translate(${(sx / SCREEN_W) * 100}%, ${(sy / SCREEN_H) * 100}%)`,
  )
  const dotTransform = useTransform(dotScale, (s) => `translate(-50%, -50%) scale(${s})`)

  // A firmer bump the moment the stylus jams against a screen edge
  const atEdge = { x: false, y: false }

  /** Move the stylus by logical canvas px */
  function movePx(axis: Axis, px: number) {
    const mv = axis === 'x' ? x : y
    const max = (axis === 'x' ? SCREEN_W : SCREEN_H) - SCREEN_MARGIN
    const raw = mv.get() + px
    const clamped = clamp(raw, SCREEN_MARGIN, max)
    const hitEdge = raw !== clamped
    if (hitEdge && !atEdge[axis]) {
      haptics.bump()
      sounds.thud()
      // Visual twin of the haptic bump, for devices that can't vibrate
      animate(dotScale, [1, 2, 1], { duration: 0.25, ease: 'easeOut' })
    }
    atEdge[axis] = hitEdge
    mv.set(clamped)
  }

  /** Move the stylus by degrees of knob rotation */
  function moveDeg(axis: Axis, degrees: number) {
    movePx(axis, degrees * KNOB_SENSITIVITY)
  }

  /** Wipe the screen clean (the stylus stays where it is, like the real toy) */
  function clear() {
    ctx?.clearRect(0, 0, SCREEN_W, SCREEN_H)
  }

  return {
    canvasRef,
    strokeColor,
    strokeWidth,
    dotSize,
    dotLayerTransform,
    dotTransform,
    movePx,
    moveDeg,
    clear,
  }
}
