<script setup lang="ts">
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring, useTransform, useVelocity } from 'motion-v'

interface Sketch {
  id: number
  name: string
  pathname: string
  likes: number
  createdAt: string
}

const { data: sketches, pending } = useFetch<Sketch[]>('/api/sketches')
const prefersReduced = useReducedMotion()
const { isLiked, toggleLike, like } = useSketchLikes()

useHead({ title: 'Écran Magique — Gallery' })

type ViewMode = 'grid' | 'list'
const view = useLocalStorage<ViewMode>('ecran-gallery-view', 'grid')
const viewOptions: { value: ViewMode, label: string }[] = [
  { value: 'grid', label: 'Grid' },
  { value: 'list', label: 'List' },
]

// Floating preview that chases the cursor in list view (fine pointers only)
const finePointer = useMediaQuery('(pointer: fine)')
const previewEnabled = computed(() => finePointer.value && !prefersReduced.value)

const activeIndex = ref<number | null>(null)
const previewOpen = ref(false)
const activeSketch = computed(() =>
  activeIndex.value == null ? null : (sketches.value?.[activeIndex.value] ?? null),
)

const cursorX = useMotionValue(0)
const cursorY = useMotionValue(0)
const follow = { stiffness: 160, damping: 22, mass: 0.7 }
const previewX = useSpring(cursorX, follow)
const previewY = useSpring(cursorY, follow)
const tilt = useTransform(useVelocity(previewX), [-2400, 0, 2400], [-8, 0, 8])

const previewDimmed = ref(false)
const previewAnimate = computed(() => ({
  opacity: previewDimmed.value ? 0.1 : 1,
  scale: 1,
}))

function onPageMouseMove(event: MouseEvent) {
  cursorX.set(event.clientX)
  cursorY.set(event.clientY)
}

function openPreview(index: number) {
  activeIndex.value = index
  previewOpen.value = true
}

function closePreview() {
  previewOpen.value = false
  activeIndex.value = null
}

watch(view, closePreview)

// Double-click the line → Instagram-style heart burst at the click point
const bursts = ref<{ id: number, sketchId: number, x: number, y: number }[]>([])
let burstId = 0

function onListDoubleClick(event: MouseEvent, sketch: Sketch) {
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  const id = ++burstId
  bursts.value.push({ id, sketchId: sketch.id, x: event.clientX - rect.left, y: event.clientY - rect.top })
  like(sketch)
  window.setTimeout(() => {
    bursts.value = bursts.value.filter(b => b.id !== id)
  }, 850)
}

function timeAgo(value: string) {
  const diff = Date.now() - new Date(value).getTime()
  const minutes = Math.floor(diff / 60_000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} h ago`
  const days = Math.floor(hours / 24)
  return days === 1 ? 'yesterday' : `${days} days ago`
}
</script>

<template>
  <div class="mx-auto max-w-5xl px-4 py-8 sm:px-8" @mousemove="onPageMouseMove">
    <motion.header
      class="flex flex-wrap items-end justify-between gap-4"
      :initial="prefersReduced ? { opacity: 0 } : { opacity: 0, y: 10 }"
      :animate="prefersReduced ? { opacity: 1 } : { opacity: 1, y: 0 }"
      :transition="{ duration: 0.4 }"
    >
      <div>
        <h1 class="font-logo text-4xl font-bold text-etch-red italic">The Gallery</h1>
        <p class="mt-1 text-sm text-stone-500">Sketches shared by everyone, freshest first.</p>
      </div>
      <div class="flex items-center gap-3">
        <div
          v-if="sketches?.length"
          role="group"
          aria-label="Gallery view"
          class="flex items-center rounded-full bg-white/75 p-1 shadow-[0_2px_10px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.9)] ring-1 ring-stone-900/10 backdrop-blur-sm"
        >
          <button
            v-for="opt in viewOptions"
            :key="opt.value"
            type="button"
            :aria-pressed="view === opt.value"
            class="relative rounded-full px-3 py-1.5 text-sm font-medium transition-colors duration-200"
            :class="view === opt.value ? 'text-white' : 'text-stone-500 hover:text-stone-800'"
            @click="view = opt.value"
          >
            <motion.span
              v-if="view === opt.value"
              layout-id="gallery-view-pill"
              class="absolute inset-0 rounded-full bg-stone-900"
              :transition="{ type: 'spring', stiffness: 500, damping: 38 }"
            />
            <span class="relative z-10 flex items-center gap-1.5">
              <svg v-if="opt.value === 'grid'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4">
                <rect x="3" y="3" width="7" height="7" rx="1.5" />
                <rect x="14" y="3" width="7" height="7" rx="1.5" />
                <rect x="3" y="14" width="7" height="7" rx="1.5" />
                <rect x="14" y="14" width="7" height="7" rx="1.5" />
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4">
                <path d="M8 6h13" />
                <path d="M8 12h13" />
                <path d="M8 18h13" />
                <path d="M3 6h.01" />
                <path d="M3 12h.01" />
                <path d="M3 18h.01" />
              </svg>
              <span class="hidden sm:inline">{{ opt.label }}</span>
            </span>
          </button>
        </div>
        <NuxtLink
          to="/"
          class="flex items-center gap-2 rounded-full bg-white/75 px-5 py-2.5 text-sm font-medium text-stone-600 shadow-[0_2px_10px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.9)] ring-1 ring-stone-900/10 backdrop-blur-sm transition-colors hover:text-stone-800"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4">
            <path d="m12 19-7-7 7-7" />
            <path d="M19 12H5" />
          </svg>
          Back to drawing
        </NuxtLink>
      </div>
    </motion.header>

    <p v-if="pending" class="mt-16 text-center text-sm text-stone-400">Loading sketches…</p>

    <motion.div
      v-else-if="!sketches?.length"
      class="mt-16 flex flex-col items-center gap-3 text-center"
      :initial="{ opacity: 0 }"
      :animate="{ opacity: 1 }"
    >
      <p class="text-sm text-stone-500">No sketches here yet — yours could be the first!</p>
      <NuxtLink to="/" class="text-sm font-medium text-etch-red hover:underline">Start drawing →</NuxtLink>
    </motion.div>

    <AnimatePresence v-else mode="wait">
      <motion.div
        v-if="view === 'grid'"
        key="grid"
        class="mx-auto mt-10 grid max-w-4xl grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-16"
        :initial="{ opacity: 0 }"
        :animate="{ opacity: 1 }"
        :exit="prefersReduced ? { opacity: 0 } : { opacity: 0, y: -10 }"
        :transition="{ duration: 0.15 }"
      >
        <GalleryGridItem
          v-for="(sketch, i) in sketches"
          :key="sketch.id"
          :sketch="sketch"
          :index="i"
          :reduced="prefersReduced"
          :time-ago="timeAgo(sketch.createdAt)"
        />
      </motion.div>

      <motion.ul
        v-else
        key="list"
        class="mt-8 border-t border-stone-900/10"
        :initial="prefersReduced ? { opacity: 0 } : { opacity: 0, y: 10 }"
        :animate="prefersReduced ? { opacity: 1 } : { opacity: 1, y: 0 }"
        :exit="prefersReduced ? { opacity: 0 } : { opacity: 0, y: -10 }"
        :transition="{ duration: 0.15 }"
        @mouseleave="closePreview"
      >
        <motion.li
          v-for="(sketch, i) in sketches"
          :key="sketch.id"
          class="group relative flex cursor-default items-center gap-3 border-b border-stone-900/10 py-4 select-none sm:gap-5 sm:py-5"
          :initial="prefersReduced ? { opacity: 0 } : { opacity: 0, y: 14 }"
          :animate="prefersReduced ? { opacity: 1 } : { opacity: 1, y: 0 }"
          :transition="{ type: 'spring', stiffness: 280, damping: 26, delay: Math.min(i * 0.035, 0.4) }"
          @mouseenter="openPreview(i)"
          @dblclick="onListDoubleClick($event, sketch)"
        >
          <span class="w-7 shrink-0 text-[11px] tabular-nums text-stone-400">{{ String(i + 1).padStart(2, '0') }}</span>
          <div
            class="flex min-w-0 items-center gap-3 sm:gap-5"
            @mouseenter="previewDimmed = true"
            @mouseleave="previewDimmed = false"
          >
            <h3 class="truncate text-xl font-semibold tracking-tight text-stone-800 transition-colors duration-300 group-hover:text-etch-red sm:text-3xl">
              {{ sketch.name }}
            </h3>
            <SketchLikeButton big :liked="isLiked(sketch.id)" :count="sketch.likes" @toggle="toggleLike(sketch)" />
          </div>
          <span class="ml-auto shrink-0 text-[11px] text-stone-400 transition-colors duration-300 group-hover:text-stone-500 sm:text-xs">{{ timeAgo(sketch.createdAt) }}</span>
          <AnimatePresence>
            <motion.div
              v-for="b in bursts.filter(b => b.sketchId === sketch.id)"
              :key="b.id"
              class="pointer-events-none absolute z-[60]"
              :style="{ left: `${b.x}px`, top: `${b.y}px` }"
              :initial="prefersReduced ? { opacity: 0 } : { opacity: 0, scale: 0.6, y: 0, rotate: -8 }"
              :animate="prefersReduced
                ? { opacity: [0, 1, 0] }
                : { opacity: [0, 1, 1, 0], scale: [0.6, 1.15, 1, 1], y: [0, -6, -28, -40], rotate: [-8, 4, 0, 0] }"
              :exit="{ opacity: 0 }"
              :transition="{ duration: 0.8, times: prefersReduced ? [0, 0.3, 1] : [0, 0.25, 0.65, 1], ease: 'easeOut' }"
            >
              <svg
                viewBox="0 0 24 24"
                class="h-16 w-16 -translate-x-1/2 -translate-y-1/2 fill-etch-red stroke-etch-red drop-shadow-[0_4px_14px_rgba(224,39,24,0.45)]"
              >
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
            </motion.div>
          </AnimatePresence>
        </motion.li>
      </motion.ul>
    </AnimatePresence>

    <AnimatePresence>
      <motion.div
        v-if="view === 'list' && previewOpen && activeSketch && previewEnabled"
        class="pointer-events-none fixed top-0 left-0 z-50"
        :style="{ x: previewX, y: previewY, rotate: tilt }"
        :initial="{ opacity: 0, scale: 0.9 }"
        :animate="previewAnimate"
        :exit="{ opacity: 0, scale: 0.9 }"
        :transition="{ type: 'spring', stiffness: 320, damping: 22 }"
      >
        <div class="w-64 -translate-x-1/2 -translate-y-1/2 sm:w-80">
          <SketchFrame :src="`/images/${activeSketch.pathname}`" :alt="activeSketch.name" eager />
        </div>
      </motion.div>
    </AnimatePresence>
  </div>
</template>
