<script setup lang="ts">
import { motion } from 'motion-v'

const props = defineProps<{
  /** Renders a NuxtLink instead of a button */
  to?: string
  /** Quiet text-only variant, no pill background */
  ghost?: boolean
}>()

const classes = computed(() => [
  'flex items-center gap-2 rounded-full py-2.5 text-sm font-medium',
  props.ghost
    ? 'px-4 text-stone-500 transition-colors hover:text-stone-700'
    : 'px-5 cursor-pointer bg-white/75 text-stone-600 shadow-[0_2px_10px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.9)] ring-1 ring-stone-900/10 backdrop-blur-sm',
])
</script>

<template>
  <NuxtLink v-if="props.to" :to="props.to" :class="classes">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4">
      <slot name="icon" />
    </svg>
    <slot />
  </NuxtLink>
  <motion.button
    v-else
    type="button"
    :class="classes"
    :while-hover="{ scale: 1.03 }"
    :while-press="{ scale: 0.97 }"
    :transition="{ type: 'spring', stiffness: 500, damping: 25 }"
  >
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4">
      <slot name="icon" />
    </svg>
    <slot />
  </motion.button>
</template>
