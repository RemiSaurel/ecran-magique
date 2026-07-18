<script setup lang="ts">
const prefersReduced = useMediaQuery('(prefers-reduced-motion: reduce)')
const lenisOptions = computed(() => ({
  lerp: 0.16,
  smoothWheel: !prefersReduced.value,
  wheelMultiplier: 1,
}))
</script>

<template>
  <VueLenis root auto-raf :options="lenisOptions">
    <div class="min-h-dvh bg-[radial-gradient(120%_120%_at_50%_0%,#fdfbf7_0%,#f0ece4_55%,#e2ddd2_100%)]">
      <NuxtPage />
    </div>
  </VueLenis>
</template>
