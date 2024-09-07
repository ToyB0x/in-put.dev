import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'
import { createInsertSchema } from 'drizzle-zod'

export const users = sqliteTable(
  'users',
  {
    id: integer('id').primaryKey(),
    name: text('name').notNull().default('ToyB0x'),
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
    nameIdx: uniqueIndex('name').on(users.name),
    emailIdx: uniqueIndex('emailIdx').on(users.email),
  }),
)

export const insertUserSchema = createInsertSchema(users)
