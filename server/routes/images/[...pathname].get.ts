import { blob } from 'hub:blob'

export default eventHandler((event) => {
  const pathname = getRouterParam(event, 'pathname') ?? ''
  // only gallery sketches are ever served from here
  if (!pathname.startsWith('sketches/')) {
    throw createError({ statusCode: 404 })
  }
  setHeader(event, 'Cache-Control', 'public, max-age=31536000, immutable')
  return blob.serve(event, pathname)
})
