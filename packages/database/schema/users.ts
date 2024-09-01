import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

export const users = sqliteTable(
  'users',
  {
    id: integer('id').primaryKey(),
    email: text('email').notNull(),
    displayName: text('displayName'),
    createdAt: text('createdAt')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updatedAt')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    hasDeleted: integer('hasDeleted', { mode: 'boolean' }).notNull().default(false),
  },
  (users) => ({
    emailIdx: uniqueIndex('emailIdx').on(users.email),
  }),
)
