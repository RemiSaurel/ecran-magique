import { desc } from 'drizzle-orm'
import { db, schema } from 'hub:db'

export default eventHandler(() => {
  return db
    .select()
    .from(schema.sketches)
    .orderBy(desc(schema.sketches.createdAt), desc(schema.sketches.id))
    .limit(100)
})
