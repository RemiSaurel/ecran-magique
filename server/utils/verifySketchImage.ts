import { SCREEN_H, SCREEN_W } from '../../app/utils/etch'

const EXPECTED_WIDTH = SCREEN_W * 2
const EXPECTED_HEIGHT = SCREEN_H * 2

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]

function readPngDimensions(bytes: Uint8Array): { width: number, height: number } | null {
  if (bytes.length < 24 || !PNG_SIGNATURE.every((b, i) => bytes[i] === b)) return null
  // IHDR is always the first chunk right after the signature (PNG spec)
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  return { width: view.getUint32(16), height: view.getUint32(20) }
}

function readWebpDimensions(bytes: Uint8Array): { width: number, height: number } | null {
  if (
    bytes.length < 30
    || bytes[0] !== 0x52 || bytes[1] !== 0x49 || bytes[2] !== 0x46 || bytes[3] !== 0x46 // "RIFF"
    || bytes[8] !== 0x57 || bytes[9] !== 0x45 || bytes[10] !== 0x42 || bytes[11] !== 0x50 // "WEBP"
  ) return null

  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  const fourcc = String.fromCharCode(bytes[12]!, bytes[13]!, bytes[14]!, bytes[15]!)

  if (fourcc === 'VP8 ') {
    // Lossy: sync code at 23-25 (0x9d 0x01 0x2a), then 14-bit width/height, LE
    if (bytes[23] !== 0x9d || bytes[24] !== 0x01 || bytes[25] !== 0x2a) return null
    return { width: view.getUint16(26, true) & 0x3fff, height: view.getUint16(28, true) & 0x3fff }
  }
  if (fourcc === 'VP8L') {
    if (bytes[20] !== 0x2f) return null
    const bits = view.getUint32(21, true)
    return { width: (bits & 0x3fff) + 1, height: ((bits >>> 14) & 0x3fff) + 1 }
  }
  if (fourcc === 'VP8X') {
    const width = 1 + (bytes[24]! | (bytes[25]! << 8) | (bytes[26]! << 16))
    const height = 1 + (bytes[27]! | (bytes[28]! << 8) | (bytes[29]! << 16))
    return { width, height }
  }
  return null
}

export async function verifySketchImage(image: File) {
  const bytes = new Uint8Array(await image.arrayBuffer())

  const dimensions = image.type === 'image/png' ? readPngDimensions(bytes) : readWebpDimensions(bytes)

  if (!dimensions) {
    throw createError({ statusCode: 400, statusMessage: 'File is not a valid image of the declared type' })
  }
  if (dimensions.width !== EXPECTED_WIDTH || dimensions.height !== EXPECTED_HEIGHT) {
    throw createError({ statusCode: 400, statusMessage: 'Image must be a sketch export from the app' })
  }
}
