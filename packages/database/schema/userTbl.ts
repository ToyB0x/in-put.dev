import { AnySQLiteColumn, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core'
import { SQL, sql } from 'drizzle-orm'
import { createInsertSchema } from 'drizzle-zod'
import { z } from 'zod'
import { customTimestamp } from './customTimestamp'

export const userTbl = sqliteTable(
  'user',
  {
    id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: false }),
    name: text('name', { length: 12 }).notNull(),
    displayName: text('display_name', { length: 24 }).notNull(),
    email: text('email', { length: 256 }).notNull(),
    firebaseUid: text('firebase_uid', { length: 36 }).unique('uq_user_firebase_uid').notNull(),
    createdAt: customTimestamp('created_at')
      .notNull()
      .default(sql`(UNIXEPOCH())`),
    updatedAt: customTimestamp('updated_at')
      .notNull()
      .default(sql`(UNIXEPOCH())`)
      .$onUpdate(() => new Date()),
  },
  (tbl) => ({
    uniqueLowerUserName: uniqueIndex('uq_user_lower_name').on(lower(tbl.name)),
    uniqueLowerEmail: uniqueIndex('uq_user_lower_email').on(lower(tbl.email)),
  }),
)

// custom lower function
export function lower(email: AnySQLiteColumn): SQL {
  return sql`lower(${email})`
}

export const insertUserTblSchema = createInsertSchema(userTbl, {
  name: () => z.string().min(3).max(12), // add more constraints because citext can't have length constraint
})
// Example of relations
// export const userRelations = relations(userTbl, ({ many }) => ({
//   urls: many(url),
// }))
