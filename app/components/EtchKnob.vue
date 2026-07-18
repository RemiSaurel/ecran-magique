<script setup lang="ts">
import { motion, useMotionValue, useSpring } from 'motion-v'

const emit = defineEmits<{ turn: [degrees: number] }>()

const haptics = useHaptics()
const sounds = useToySounds()

const rotation = useMotionValue(0)
// A stiff spring keeps drags feeling 1:1 while smoothing wheel/keyboard steps
const displayRotation = useSpring(rotation, { stiffness: 900, damping: 60 })

const root = ref<HTMLElement>()
const dragging = ref(false)
let lastAngle = 0

function angleAt(e: PointerEvent) {
  const rect = root.value!.getBoundingClientRect()
  const cx = rect.left + rect.width / 2
  const cy = rect.top + rect.height / 2
  return (Math.atan2(e.clientY - cy, e.clientX - cx) * 180) / Math.PI
}

function onPointerDown(e: PointerEvent) {
  root.value?.setPointerCapture(e.pointerId)
  dragging.value = true
  lastAngle = angleAt(e)
  e.stopPropagation()
  e.preventDefault()
}

function onPointerMove(e: PointerEvent) {
  if (!dragging.value) return
  const angle = angleAt(e)
  let delta = angle - lastAngle
  if (delta > 180) delta -= 360
  if (delta < -180) delta += 360
  lastAngle = angle
  spinBy(delta)
}

function onPointerUp(e: PointerEvent) {
  dragging.value = false
  root.value?.releasePointerCapture(e.pointerId)
}

// Haptic detents: a tiny click roughly every 15° of rotation, like a real ratchet
let detentAccumulator = 0
function feelDetents(degrees: number) {
  detentAccumulator += Math.abs(degrees)
  if (detentAccumulator >= 15) {
    detentAccumulator %= 15
    haptics.tick()
    sounds.tick()
  }
}

function spinBy(degrees: number) {
  rotation.set(rotation.get() + degrees)
  feelDetents(degrees)
  emit('turn', degrees)
}

/** Spin the knob visually without emitting (movement already handled by caller) */
function spinSilently(degrees: number) {
  rotation.set(rotation.get() + degrees)
  feelDetents(degrees)
}

function onWheel(e: WheelEvent) {
  spinBy((e.deltaY + e.deltaX) * 0.45)
}

defineExpose({ spinBy, spinSilently })
</script>

<template>
  <div
    ref="root"
    class="relative aspect-square w-full select-none touch-none cursor-grab active:cursor-grabbing"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @pointercancel="onPointerUp"
    @wheel.prevent="onWheel"
  >
    <!-- Drop shadow under the knob -->
    <div class="absolute inset-0 rounded-full shadow-[0_10px_18px_-4px_rgba(90,10,4,0.55),0_3px_6px_rgba(90,10,4,0.4)]" />

    <motion.div
      class="absolute inset-0 rounded-full"
      :style="{ rotate: displayRotation }"
      :animate="{ scale: dragging ? 1.05 : 1 }"
      :transition="dragging
        ? { type: 'spring', stiffness: 700, damping: 32 }
        : { type: 'spring', stiffness: 350, damping: 22 }"
    >
      <!-- Knurled edge -->
      <div
        class="absolute inset-0 rounded-full"
        style="background: repeating-conic-gradient(#ffffff 0deg 3.5deg, #b9b9c0 3.5deg 5.5deg, #e6e6ea 5.5deg 7.5deg)"
      />
      <!-- Domed face -->
      <div
        class="absolute inset-[11%] rounded-full shadow-[inset_0_3px_7px_rgba(255,255,255,0.95),inset_0_-5px_10px_rgba(120,120,135,0.55),0_1px_3px_rgba(60,60,70,0.35)]"
        style="background: radial-gradient(circle at 38% 30%, #ffffff 0%, #f2f2f5 45%, #d8d8de 100%)"
      />
      <!-- Rotation indicator -->
      <div class="absolute left-1/2 top-[17%] h-[9%] w-[9%] -translate-x-1/2 rounded-full bg-[#c9c9d1] shadow-[inset_0_1.5px_2.5px_rgba(90,90,105,0.7),0_1px_1px_rgba(255,255,255,0.9)]" />
    </motion.div>
  </div>
</template>
