<script setup lang="ts">
import { motion } from 'motion-v'

const props = defineProps<{ colors: string[] }>()
const model = defineModel<string>({ required: true })

const haptics = useHaptics()
const sounds = useToySounds()

function pick(color: string) {
  if (color === model.value) return
  model.value = color
  haptics.tick()
  // Each swatch gets its own bubble pitch, rising along the tray
  sounds.pop(0.85 + props.colors.indexOf(color) * 0.08)
}
</script>

<template>
  <div class="flex items-center gap-1.5">
    <motion.button
      v-for="color in props.colors"
      :key="color"
      type="button"
      class="relative h-6 w-6 cursor-pointer rounded-full"
      :style="{ backgroundColor: color }"
      :aria-label="`Draw in ${color}`"
      :aria-pressed="color === model"
      :while-hover="{ scale: 1.15 }"
      :while-press="{ scale: 0.9 }"
      :transition="{ type: 'spring', stiffness: 550, damping: 25 }"
      @click="pick(color)"
    >
      <!-- Selection ring slides between swatches -->
      <motion.div
        v-if="color === model"
        layout-id="active-color-ring"
        class="absolute -inset-[4px] rounded-full ring-2 ring-stone-500/70"
        :transition="{ type: 'spring', stiffness: 550, damping: 35 }"
      />
    </motion.button>
  </div>
</template>
