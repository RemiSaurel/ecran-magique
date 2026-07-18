import { blob } from 'hub:blob'
import { db, schema } from 'hub:db'

export default eventHandler(async (event) => {
  const form = await readFormData(event)

  const name = String(form.get('name') ?? '').trim()
  if (!name || name.length > 40) {
    throw createError({ statusCode: 400, statusMessage: 'Name must be between 1 and 40 characters' })
  }

  const image = form.get('image')
  if (!(image instanceof File)) {
    throw createError({ statusCode: 400, statusMessage: 'Missing image' })
  }
  ensureBlob(image, { maxSize: '4MB', types: ['image/webp', 'image/png'] })

  const stored = await blob.put(`${crypto.randomUUID()}.${image.type === 'image/webp' ? 'webp' : 'png'}`, image, {
    prefix: 'sketches',
    contentType: image.type,
  })

  const [sketch] = await db
    .insert(schema.sketches)
    .values({ name, pathname: stored.pathname, createdAt: new Date() })
    .returning()

  return sketch
})
