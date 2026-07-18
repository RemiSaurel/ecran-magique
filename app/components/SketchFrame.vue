<script setup lang="ts">
defineProps<{
  src: string
  alt: string
  eager?: boolean
}>()
</script>

<template>
  <div
    class="rounded-2xl p-2 shadow-[0_10px_24px_-8px_rgba(150,15,6,0.35),inset_0_1px_3px_rgba(255,255,255,0.35),inset_0_-3px_7px_rgba(0,0,0,0.25)]"
    style="background: linear-gradient(180deg, #f4523f 0%, #e02718 55%, #b81208 100%)"
  >
    <div class="overflow-hidden rounded-xl shadow-[inset_0_3px_8px_rgba(0,0,0,0.25)]">
      <img
        :src="src"
        :alt="alt"
        :loading="eager ? 'eager' : 'lazy'"
        draggable="false"
        class="aspect-[4/3] w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
      />
    </div>
  </div>
</template>
