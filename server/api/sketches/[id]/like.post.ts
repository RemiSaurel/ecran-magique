import { eq, sql } from 'drizzle-orm'
import { db, schema } from 'hub:db'

export default eventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id)) {
    throw createError({ statusCode: 400, message: 'Invalid sketch id' })
  }

  const { liked } = await readBody<{ liked: boolean }>(event)
  const delta = liked ? 1 : -1

  await db
    .update(schema.sketches)
    .set({ likes: sql`max(0, ${schema.sketches.likes} + ${delta})` })
    .where(eq(schema.sketches.id, id))

  const row = await db
    .select({ likes: schema.sketches.likes })
    .from(schema.sketches)
    .where(eq(schema.sketches.id, id))
    .get()

  if (!row) {
    throw createError({ statusCode: 404, message: 'Sketch not found' })
  }

  return { likes: row.likes }
})
