<script setup lang="ts">
import { AnimatePresence, motion } from 'motion-v'

const props = defineProps<{ publishing: boolean; error: string }>()
const open = defineModel<boolean>('open', { required: true })
const emit = defineEmits<{ publish: [name: string] }>()

const name = ref('')
const inputRef = ref<HTMLInputElement>()

watch(open, (isOpen) => {
  if (isOpen) {
    name.value = ''
    nextTick(() => inputRef.value?.focus())
  }
})

function submit() {
  const trimmed = name.value.trim()
  if (!trimmed || props.publishing) return
  emit('publish', trimmed)
}
</script>

<template>
  <Teleport to="body">
    <AnimatePresence>
      <motion.div
        v-if="open"
        class="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/25 p-4 backdrop-blur-[2px]"
        :initial="{ opacity: 0 }"
        :animate="{ opacity: 1 }"
        :exit="{ opacity: 0 }"
        :transition="{ duration: 0.2 }"
        @click.self="open = false"
        @keydown.esc="open = false"
      >
        <motion.div
          class="w-full max-w-sm rounded-3xl bg-white p-6 shadow-[0_24px_60px_-12px_rgba(0,0,0,0.25)] ring-1 ring-stone-900/10"
          :initial="{ opacity: 0, scale: 0.94, y: 12 }"
          :animate="{ opacity: 1, scale: 1, y: 0 }"
          :exit="{ opacity: 0, scale: 0.96, y: 8 }"
          :transition="{ type: 'spring', stiffness: 400, damping: 30 }"
        >
          <h2 class="text-base font-semibold text-stone-800">Share to the gallery</h2>
          <p class="mt-1 text-sm text-stone-500">Name your sketch — it will be visible to everyone.</p>

          <form class="mt-4 flex flex-col gap-3" @submit.prevent="submit">
            <input
              ref="inputRef"
              v-model="name"
              type="text"
              maxlength="40"
              placeholder="My masterpiece"
              class="w-full rounded-full bg-stone-100 px-4 py-2.5 text-sm text-stone-800 placeholder-stone-400 outline-none ring-etch-red/40 focus:ring-2"
            />
            <p v-if="props.error" class="px-1 text-xs text-red-600">{{ props.error }}</p>
            <div class="mt-1 flex items-center justify-end gap-2">
              <motion.button
                type="button"
                class="cursor-pointer rounded-full px-4 py-2.5 text-sm font-medium text-stone-500 hover:text-stone-700"
                :while-press="{ scale: 0.97 }"
                @click="open = false"
              >
                Cancel
              </motion.button>
              <motion.button
                type="submit"
                class="cursor-pointer rounded-full bg-etch-red px-5 py-2.5 text-sm font-medium text-white shadow-[0_2px_10px_rgba(224,39,24,0.35)] disabled:opacity-50"
                :disabled="publishing || !name.trim()"
                :while-hover="{ scale: 1.03 }"
                :while-press="{ scale: 0.97 }"
                :transition="{ type: 'spring', stiffness: 500, damping: 25 }"
              >
                {{ publishing ? 'Publishing…' : 'Publish' }}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  </Teleport>
</template>
