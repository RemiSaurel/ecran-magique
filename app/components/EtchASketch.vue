<script setup lang="ts">
import { motion, useReducedMotion } from 'motion-v'
import EtchKnob from './EtchKnob.vue'
import { ETCH_PALETTE, KNOB_SENSITIVITY, STROKE_SIZES } from '~/utils/etch'
import { composeScreenCanvas, composeToyCanvas, downloadCanvasPng } from '~/utils/sketchExport'

const prefersReduced = useReducedMotion()
const haptics = useHaptics()
const sounds = useToySounds()
const soundOn = sounds.enabled

const palette = ETCH_PALETTE
const sizes = STROKE_SIZES

// The drawing surface: canvas, spring-chased stylus, stroke style, edge feedback
const { canvasRef, strokeColor, strokeWidth, dotSize, dotLayerTransform, dotTransform, movePx, moveDeg, clear }
  = useEtchStylus()

// Shake to erase — via button, space, double-click, shaking the dragged toy, or shaking the phone
const { overlayOpacity, shakeX, shakeY, shakeRotate, shake, onDeviceDrag, onDeviceDragEnd }
  = useShakeToErase(clear)

// The knobs: turning them moves the stylus; other inputs spin them back in sync
const leftKnob = ref<InstanceType<typeof EtchKnob>>()
const rightKnob = ref<InstanceType<typeof EtchKnob>>()

// Arrow keys spin the knobs (which move the stylus via @turn), space shakes
useEtchKeyboard({
  turnX: (deg) => leftKnob.value?.spinBy(deg),
  turnY: (deg) => rightKnob.value?.spinBy(deg),
  shake,
})

// Drawing directly on the screen — the stylus follows and the knobs spin along
const { screenRef, onScreenPointerDown, onScreenWheel } = useScreenSketch((dx, dy) => {
  leftKnob.value?.spinSilently(dx / KNOB_SENSITIVITY)
  rightKnob.value?.spinSilently(dy / KNOB_SENSITIVITY)
  movePx('x', dx)
  movePx('y', dy)
})

// Share to the online gallery
const { shareOpen, publishing, publishError, publish } = useSketchPublish(() =>
  canvasRef.value ? composeScreenCanvas(canvasRef.value) : null,
)

// Save the whole toy as a PNG
function saveSketch() {
  if (!canvasRef.value) return
  downloadCanvasPng(composeToyCanvas(canvasRef.value), 'ecran-magique.png')
  haptics.tick()
  sounds.pop(1.1)
}
</script>

<template>
  <div class="flex w-full flex-col items-center gap-5 sm:gap-7">
    <!-- Draggable outer shell: pick the toy up, shake it hard to erase -->
    <motion.div
      class="w-[min(94vw,560px,calc(100dvh-170px))] cursor-grab active:cursor-grabbing"
      drag
      :drag-snap-to-origin="true"
      :drag-elastic="0.18"
      :drag-momentum="false"
      :while-drag="{ scale: 1.02 }"
      :initial="prefersReduced ? { opacity: 0 } : { opacity: 0, scale: 0.9, y: 28 }"
      :animate="prefersReduced ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }"
      :transition="{ type: 'spring', stiffness: 120, damping: 15, delay: 0.05 }"
      @drag="onDeviceDrag"
      @drag-end="onDeviceDragEnd"
      @dblclick="shake"
    >
      <!-- Inner shell owns the shake wiggle so it never fights the drag transform -->
      <motion.div
        class="rounded-[2.2rem] p-4 pb-5 sm:rounded-[2.8rem] sm:p-8 sm:pb-9 shadow-[0_35px_70px_-18px_rgba(150,15,6,0.5),0_12px_28px_-12px_rgba(0,0,0,0.3),inset_0_3px_8px_rgba(255,255,255,0.4),inset_0_-8px_18px_rgba(0,0,0,0.28)]"
        style="background: linear-gradient(180deg, #f4523f 0%, #e02718 42%, #cb1a0c 78%, #b81208 100%)"
        :style="{ x: shakeX, y: shakeY, rotate: shakeRotate }"
      >
        <!-- Screen bezel -->
        <div class="rounded-[1.4rem] p-2 sm:rounded-[1.7rem] sm:p-2.5 bg-[#bd1508] shadow-[inset_0_5px_12px_rgba(0,0,0,0.5),inset_0_-1px_3px_rgba(255,255,255,0.2)]">
          <div
            ref="screenRef"
            class="etch-screen-surface relative aspect-[4/3] touch-none overflow-hidden rounded-[1rem] sm:rounded-[1.25rem] pointer-fine:cursor-crosshair"
            @wheel.prevent="onScreenWheel"
            @pointerdown="onScreenPointerDown"
          >
            <canvas ref="canvasRef" class="absolute inset-0 h-full w-full" />

            <!-- Stylus position -->
            <motion.div class="pointer-events-none absolute inset-0" :style="{ transform: dotLayerTransform }">
              <motion.div
                class="absolute top-0 left-0 rounded-full opacity-55"
                :style="{ transform: dotTransform, backgroundColor: strokeColor, width: dotSize, height: dotSize }"
              />
            </motion.div>

            <!-- Aluminium dust that coats the screen during a shake -->
            <motion.div
              class="etch-screen-surface pointer-events-none absolute inset-0"
              :style="{ opacity: overlayOpacity }"
            />

            <!-- Glass inner shadow -->
            <div class="pointer-events-none absolute inset-0 rounded-[1rem] sm:rounded-[1.25rem] shadow-[inset_0_8px_22px_rgba(0,0,0,0.3),inset_0_-3px_10px_rgba(255,255,255,0.4)]" />
          </div>
        </div>

        <!-- Knobs + logo -->
        <div class="mt-4 flex items-center justify-between gap-3 px-0.5 sm:mt-6 sm:gap-4">
          <div class="relative w-[21%] shrink-0 sm:w-[19%]">
            <div class="absolute -top-4 left-1/2 -translate-x-1/2 text-[10px] leading-none text-white/85 select-none" aria-hidden="true">◀ ▶</div>
            <motion.div
              :initial="prefersReduced ? { opacity: 0 } : { scale: 0.5, opacity: 0, rotate: -120 }"
              :animate="prefersReduced ? { opacity: 1 } : { scale: 1, opacity: 1, rotate: 0 }"
              :transition="{ type: 'spring', stiffness: 260, damping: 17, delay: 0.4 }"
            >
              <EtchKnob ref="leftKnob" aria-label="Horizontal knob" @turn="(deg) => moveDeg('x', deg)" />
            </motion.div>
          </div>

          <motion.div
            class="min-w-0 text-center select-none"
            :initial="prefersReduced ? { opacity: 0 } : { opacity: 0, y: 8 }"
            :animate="prefersReduced ? { opacity: 1 } : { opacity: 1, y: 0 }"
            :transition="{ duration: 0.6, delay: 0.55 }"
          >
            <span
              class="font-logo block truncate text-[clamp(1rem,4.6vw,2.4rem)] leading-tight font-bold text-etch-gold italic"
              style="text-shadow: 0 2px 0 rgba(110, 15, 4, 0.75), 0 4px 10px rgba(0, 0, 0, 0.3)"
            >
              Écran Magique
            </span>
          </motion.div>

          <div class="relative w-[21%] shrink-0 sm:w-[19%]">
            <div class="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] leading-[0.6] text-white/85 select-none" aria-hidden="true">▲<br />▼</div>
            <motion.div
              :initial="prefersReduced ? { opacity: 0 } : { scale: 0.5, opacity: 0, rotate: 120 }"
              :animate="prefersReduced ? { opacity: 1 } : { scale: 1, opacity: 1, rotate: 0 }"
              :transition="{ type: 'spring', stiffness: 260, damping: 17, delay: 0.5 }"
            >
              <EtchKnob ref="rightKnob" aria-label="Vertical knob" @turn="(deg) => moveDeg('y', deg)" />
            </motion.div>
          </div>
        </div>
      </motion.div>
    </motion.div>

    <!-- Controls & hints -->
    <motion.div
      class="flex flex-col items-center gap-3"
      :initial="prefersReduced ? { opacity: 0 } : { opacity: 0, y: 10 }"
      :animate="prefersReduced ? { opacity: 1 } : { opacity: 1, y: 0 }"
      :transition="{ duration: 0.5, delay: 0.7 }"
    >
      <!-- Toolbar: colors · sizes · sound, one quiet pill -->
      <div class="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 rounded-full bg-white/75 px-4 py-2.5 shadow-[0_2px_10px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.9)] ring-1 ring-stone-900/10 backdrop-blur-sm">
        <EtchColorTray v-model="strokeColor" :colors="palette" />
        <div class="h-5 w-px bg-stone-900/10" aria-hidden="true" />
        <EtchSizeTray v-model="strokeWidth" :sizes="sizes" :color="strokeColor" />
        <div class="h-5 w-px bg-stone-900/10" aria-hidden="true" />
        <motion.button
          type="button"
          class="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full"
          :class="soundOn ? 'text-stone-500 hover:text-stone-700' : 'text-stone-300 hover:text-stone-400'"
          :aria-label="soundOn ? 'Mute sounds' : 'Unmute sounds'"
          :aria-pressed="soundOn"
          :while-hover="{ scale: 1.15 }"
          :while-press="{ scale: 0.9 }"
          :transition="{ type: 'spring', stiffness: 550, damping: 25 }"
          @click="soundOn = !soundOn"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4">
            <path d="M11 5 6 9H2v6h4l5 4z" />
            <template v-if="soundOn">
              <path d="M15.5 8.5a5 5 0 0 1 0 7" />
              <path d="M18.5 5.5a9 9 0 0 1 0 13" />
            </template>
            <template v-else>
              <line x1="16" y1="9" x2="22" y2="15" />
              <line x1="22" y1="9" x2="16" y2="15" />
            </template>
          </svg>
        </motion.button>
      </div>

      <!-- Actions -->
      <div class="flex flex-wrap items-center justify-center gap-2.5">
        <EtchPillButton @click="shake">
          <template #icon>
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </template>
          Shake to erase
        </EtchPillButton>
        <EtchPillButton @click="saveSketch">
          <template #icon>
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </template>
          Save
        </EtchPillButton>
        <EtchPillButton @click="shareOpen = true">
          <template #icon>
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
            <polyline points="16 6 12 2 8 6" />
            <line x1="12" y1="2" x2="12" y2="15" />
          </template>
          Share
        </EtchPillButton>
        <EtchPillButton to="/gallery" ghost>
          <template #icon>
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="9" cy="9" r="2" />
            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
          </template>
          Gallery
        </EtchPillButton>
      </div>

      <EtchShareDialog v-model:open="shareOpen" :publishing="publishing" :error="publishError" @publish="publish" />
      <p class="max-w-[90vw] text-center text-xs text-stone-500/90">
        <span class="pointer-coarse:hidden">Turn the knobs · Arrow keys · Draw on the screen · Grab the toy &amp; shake it</span>
        <span class="hidden pointer-coarse:inline">Spin the knobs with your thumbs · Draw with a finger · Grab the toy &amp; shake it</span>
      </p>
    </motion.div>
  </div>
</template>
