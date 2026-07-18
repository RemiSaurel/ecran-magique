<script setup lang="ts">
import { AnimatePresence, motion } from 'motion-v'

interface Sketch {
  id: number
  name: string
  pathname: string
  likes: number
  createdAt: string
}

const props = defineProps<{
  sketch: Sketch
  index: number
  reduced: boolean
  timeAgo: string
}>()

const { isLiked, toggleLike, like } = useSketchLikes()

// Double-click / double-tap the drawing → Instagram-style heart burst at the tap point
const frame = ref<HTMLElement>()
const bursts = ref<{ id: number, x: number, y: number }[]>([])
let burstId = 0

const { onDoubleClick, onTouchEnd } = useDoubleTap((point) => {
  const rect = frame.value?.getBoundingClientRect()
  if (!rect) return
  const id = ++burstId
  bursts.value.push({ id, x: point.clientX - rect.left, y: point.clientY - rect.top })
  like(props.sketch)
  window.setTimeout(() => {
    bursts.value = bursts.value.filter(b => b.id !== id)
  }, 850)
})
</script>

<template>
  <motion.div
    class="group select-none"
    :initial="reduced ? { opacity: 0 } : { opacity: 0, y: 48, scale: 0.96, rotate: index % 2 === 0 ? -1.5 : 1.5 }"
    :while-in-view="reduced ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1, rotate: 0 }"
    :viewport="{ once: true, margin: '-60px' }"
    :transition="{ type: 'spring', duration: 0.65, bounce: 0.15, delay: index < 4 ? index * 0.06 : 0 }"
  >
    <div ref="frame" class="relative cursor-pointer touch-manipulation" @dblclick="onDoubleClick" @touchend="onTouchEnd">
      <SketchFrame :src="`/images/${sketch.pathname}`" :alt="sketch.name" />
      <AnimatePresence>
        <motion.div
          v-for="b in bursts"
          :key="b.id"
          class="pointer-events-none absolute z-20"
          :style="{ left: `${b.x}px`, top: `${b.y}px` }"
          :initial="reduced ? { opacity: 0 } : { opacity: 0, scale: 0.6, y: 0, rotate: -8 }"
          :animate="reduced
            ? { opacity: [0, 1, 0] }
            : { opacity: [0, 1, 1, 0], scale: [0.6, 1.15, 1, 1], y: [0, -6, -28, -40], rotate: [-8, 4, 0, 0] }"
          :exit="{ opacity: 0 }"
          :transition="{ duration: 0.8, times: reduced ? [0, 0.3, 1] : [0, 0.25, 0.65, 1], ease: 'easeOut' }"
        >
          <svg
            viewBox="0 0 24 24"
            class="h-16 w-16 -translate-x-1/2 -translate-y-1/2 fill-etch-red stroke-etch-red drop-shadow-[0_4px_14px_rgba(224,39,24,0.45)]"
          >
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          </svg>
        </motion.div>
      </AnimatePresence>
    </div>
    <div class="mt-3 flex items-center gap-2 px-1">
      <p class="truncate text-base font-medium text-stone-700">{{ sketch.name }}</p>
      <SketchLikeButton :liked="isLiked(sketch.id)" :count="sketch.likes" @toggle="toggleLike(sketch)" />
      <span class="ml-auto shrink-0 text-xs text-stone-400">{{ timeAgo }}</span>
    </div>
  </motion.div>
</template>
