import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'
import { createInsertSchema } from 'drizzle-zod'

export const users = sqliteTable(
  'users',
  {
    id: integer('id').primaryKey(),
    userName: text('userName').notNull(),
    displayName: text('displayName').notNull(),
    email: text('email').notNull(),
    firebaseUid: text('firebaseUid').notNull(),
    createdAt: text('createdAt')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updatedAt')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    hasDeleted: integer('hasDeleted', { mode: 'boolean' }).notNull().default(false),
  },
  (users) => ({
    userNameIdx: uniqueIndex('userName').on(users.userName),
    emailIdx: uniqueIndex('emailIdx').on(users.email),
    firebaseUidIdx: uniqueIndex('firebaseUidIdx').on(users.firebaseUid),
  }),
)

export const insertUserSchema = createInsertSchema(users)
