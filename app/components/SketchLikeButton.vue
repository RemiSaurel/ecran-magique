<script setup lang="ts">
import { motion, useReducedMotion } from 'motion-v'

defineProps<{
  liked: boolean
  count: number
  big?: boolean
}>()

const emit = defineEmits<{ toggle: [] }>()
const prefersReduced = useReducedMotion()
</script>

<template>
  <button
    type="button"
    :aria-pressed="liked"
    :aria-label="liked ? 'Unlike this sketch' : 'Like this sketch'"
    class="group/like flex shrink-0 cursor-pointer items-center gap-1 transition-transform duration-150 ease-out active:scale-90"
    @click.stop="emit('toggle')"
  >
    <motion.span
      :key="String(liked)"
      :initial="false"
      :animate="liked && !prefersReduced ? { scale: [1, 1.35, 1] } : { scale: 1 }"
      :transition="{ duration: 0.45, ease: [0.34, 1.56, 0.64, 1] }"
      class="flex"
    >
      <svg
        viewBox="0 0 24 24"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="transition-colors duration-200"
        :class="[big ? 'h-5 w-5' : 'h-4 w-4', liked ? 'fill-etch-red stroke-etch-red' : 'fill-none stroke-stone-400 group-hover/like:stroke-etch-red']"
      >
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      </svg>
    </motion.span>
    <span
      class="tabular-nums transition-colors duration-200"
      :class="[big ? 'text-sm' : 'text-xs', liked ? 'text-etch-red' : 'text-stone-400 group-hover/like:text-stone-500']"
    >{{ count }}</span>
  </button>
</template>
