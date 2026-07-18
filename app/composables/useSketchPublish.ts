import { canvasToImageBlob } from '~/utils/sketchExport'

/**
 * Publishing a sketch to the online gallery: dialog state, upload,
 * and the little success celebration.
 */
export function useSketchPublish(getScreenCanvas: () => HTMLCanvasElement | null) {
  const haptics = useHaptics()
  const sounds = useToySounds()

  const shareOpen = ref(false)
  const publishing = ref(false)
  const publishError = ref('')

  async function publish(name: string) {
    const screen = getScreenCanvas()
    if (!screen || publishing.value) return
    publishing.value = true
    publishError.value = ''
    try {
      const image = await canvasToImageBlob(screen)
      const form = new FormData()
      form.append('name', name)
      form.append('image', image, image.type === 'image/webp' ? 'sketch.webp' : 'sketch.png')
      await $fetch('/api/sketches', { method: 'POST', body: form })
      sounds.pop(1.15)
      haptics.tick()
      shareOpen.value = false
      await navigateTo('/gallery')
    } catch (error: any) {
      publishError.value = error?.data?.statusMessage ?? 'Could not publish — please try again'
    } finally {
      publishing.value = false
    }
  }

  return { shareOpen, publishing, publishError, publish }
}
