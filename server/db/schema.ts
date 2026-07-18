import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const sketches = sqliteTable('sketches', {
  id: integer().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  pathname: text().notNull().unique(),
  likes: integer().notNull().default(0),
  createdAt: integer({ mode: 'timestamp' }).notNull(),
})
