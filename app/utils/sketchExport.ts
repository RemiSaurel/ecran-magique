import { SCREEN_H, SCREEN_W } from './etch'

// Pure canvas painting — no reactivity, no side effects beyond the returned
// canvas. Used by both the "Save" download and the gallery publish.

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

function paintKnob(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  ctx.save()
  // drop shadow
  ctx.shadowColor = 'rgba(90, 10, 4, 0.5)'
  ctx.shadowBlur = 14
  ctx.shadowOffsetY = 8
  ctx.fillStyle = '#e3e3e8'
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.fill()
  ctx.shadowColor = 'transparent'
  // knurled edge
  ctx.translate(cx, cy)
  for (let i = 0; i < 90; i++) {
    ctx.rotate((Math.PI * 2) / 90)
    ctx.fillStyle = i % 2 ? '#b9b9c0' : '#ffffff'
    ctx.fillRect(r * 0.86, -r * 0.035, r * 0.14, r * 0.07)
  }
  // domed face
  const face = ctx.createRadialGradient(-r * 0.25, -r * 0.35, r * 0.1, 0, 0, r * 0.95)
  face.addColorStop(0, '#ffffff')
  face.addColorStop(0.55, '#f2f2f5')
  face.addColorStop(1, '#d8d8de')
  ctx.fillStyle = face
  ctx.beginPath()
  ctx.arc(0, 0, r * 0.86, 0, Math.PI * 2)
  ctx.fill()
  // indicator dot
  ctx.fillStyle = '#c9c9d1'
  ctx.beginPath()
  ctx.arc(0, -r * 0.62, r * 0.09, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

/**
 * The whole toy — backdrop, red frame, screen with the drawing, knobs, logo —
 * so the saved image looks like the thing you drew on, not a bare canvas dump.
 */
export function composeToyCanvas(source: HTMLCanvasElement): HTMLCanvasElement {
  const OW = 800
  const OH = 800
  const out = document.createElement('canvas')
  out.width = OW * 2
  out.height = OH * 2
  const ctx = out.getContext('2d')!
  ctx.scale(2, 2)

  // page backdrop
  const backdrop = ctx.createLinearGradient(0, 0, 0, OH)
  backdrop.addColorStop(0, '#fbf8f3')
  backdrop.addColorStop(1, '#eae5da')
  ctx.fillStyle = backdrop
  ctx.fillRect(0, 0, OW, OH)

  // red frame with its shadow
  ctx.save()
  ctx.shadowColor = 'rgba(150, 15, 6, 0.35)'
  ctx.shadowBlur = 45
  ctx.shadowOffsetY = 22
  const frame = ctx.createLinearGradient(0, 40, 0, 740)
  frame.addColorStop(0, '#f4523f')
  frame.addColorStop(0.42, '#e02718')
  frame.addColorStop(0.78, '#cb1a0c')
  frame.addColorStop(1, '#b81208')
  ctx.fillStyle = frame
  ctx.beginPath()
  ctx.roundRect(40, 40, 720, 700, 60)
  ctx.fill()
  ctx.restore()

  // bezel
  ctx.fillStyle = '#bd1508'
  ctx.beginPath()
  ctx.roundRect(68, 68, 664, 504, 28)
  ctx.fill()

  // screen + the drawing
  ctx.save()
  ctx.beginPath()
  ctx.roundRect(80, 80, SCREEN_W, SCREEN_H, 20)
  ctx.clip()
  ctx.drawImage(composeScreenCanvas(source), 80, 80, SCREEN_W, SCREEN_H)
  ctx.restore()

  // knobs + logo
  paintKnob(ctx, 165, 660, 55)
  paintKnob(ctx, 635, 660, 55)
  ctx.save()
  ctx.font = 'italic bold 54px "Snell Roundhand", "Brush Script MT", "Segoe Script", cursive'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.shadowColor = 'rgba(110, 15, 4, 0.75)'
  ctx.shadowOffsetY = 3
  ctx.fillStyle = '#ffd23f'
  ctx.fillText('Écran Magique', 400, 662)
  ctx.restore()

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

export function downloadCanvasPng(canvas: HTMLCanvasElement, filename: string) {
  const link = document.createElement('a')
  link.download = filename
  link.href = canvas.toDataURL('image/png')
  link.click()
}
