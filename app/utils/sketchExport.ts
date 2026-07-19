import { SCREEN_H, SCREEN_W } from './etch'

// Pure canvas painting — no reactivity, no side effects beyond the returned
// canvas. Used by the gallery publish.

/** The drawing composited on its vintage silver screen (2× resolution) */
export function composeScreenCanvas(source: HTMLCanvasElement): HTMLCanvasElement {
  const out = document.createElement('canvas')
  out.width = SCREEN_W * 2
  out.height = SCREEN_H * 2
  const ctx = out.getContext('2d')!
  ctx.scale(2, 2)
  const silver = ctx.createLinearGradient(0, 0, 0, SCREEN_H)
  silver.addColorStop(0, '#ddd9d0')
  silver.addColorStop(1, '#cac6bb')
  ctx.fillStyle = silver
  ctx.fillRect(0, 0, SCREEN_W, SCREEN_H)
  ctx.drawImage(source, 0, 0, SCREEN_W, SCREEN_H)
  return out
}

/**
 * Compact image export for uploads: WebP shrinks a sketch from ~1.3MB (PNG)
 * to ~30KB. Browsers that can't encode WebP silently fall back to PNG per
 * spec — check blob.type to know which one you got.
 */
export function canvasToImageBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('Image export failed'))),
      'image/webp',
      0.85,
    ),
  )
}

