// Shared geometry & style constants for the toy

/** Logical drawing-surface size (canvas coordinate space) */
export const SCREEN_W = 640
export const SCREEN_H = 480

/** How close the stylus can get to the screen edge, in logical px */
export const SCREEN_MARGIN = 10

/** px of stylus travel per degree of knob rotation */
export const KNOB_SENSITIVITY = 0.5

/** Crayon palette; graphite first, like the real toy */
export const ETCH_PALETTE = ['#44444c', '#e23d2e', '#f79009', '#16a34a', '#2563eb', '#9333ea']

/** Stroke widths (logical px on the 640×480 canvas) */
export const STROKE_SIZES = [1.5, 2.4, 4, 6.5]
