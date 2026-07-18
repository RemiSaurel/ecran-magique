<script setup lang="ts">
import { motion } from 'motion-v'

const props = defineProps<{ sizes: number[]; color: string }>()
const model = defineModel<number>({ required: true })

const haptics = useHaptics()
const sounds = useToySounds()

function pick(size: number) {
  if (size === model.value) return
  model.value = size
  haptics.tick()
  // Bigger stroke, deeper bubble
  sounds.pop(1.2 - props.sizes.indexOf(size) * 0.12)
}
</script>

<template>
  <div class="flex items-center gap-1">
    <motion.button
      v-for="size in props.sizes"
      :key="size"
      type="button"
      class="relative flex h-6 w-6 cursor-pointer items-center justify-center rounded-full"
      :aria-label="`Stroke size ${size}`"
      :aria-pressed="size === model"
      :while-hover="{ scale: 1.15 }"
      :while-press="{ scale: 0.9 }"
      :transition="{ type: 'spring', stiffness: 550, damping: 25 }"
      @click="pick(size)"
    >
      <span
        class="rounded-full transition-colors duration-200"
        :style="{
          width: `${4 + size * 2.2}px`,
          height: `${4 + size * 2.2}px`,
          backgroundColor: props.color,
        }"
      />
      <!-- Selection ring slides between sizes -->
      <motion.div
        v-if="size === model"
        layout-id="active-size-ring"
        class="absolute inset-0 rounded-full ring-2 ring-stone-500/70"
        :transition="{ type: 'spring', stiffness: 550, damping: 35 }"
      />
    </motion.button>
  </div>
</template>
