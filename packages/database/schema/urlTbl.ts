import { sql } from 'drizzle-orm'
import { createInsertSchema } from 'drizzle-zod'
import { integer, sqliteTable, text, unique } from 'drizzle-orm/sqlite-core'
import { userTbl } from './userTbl'

export const urlTbl = sqliteTable(
  'url',
  {
    id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: false }),
    url: text('url', { length: 256 * 4 }).notNull(),
    count: integer('count', { mode: 'number' }).notNull().default(1),
    pageTitle: text('page_title', { length: 256 }),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`)
      .$onUpdate(() => new Date()),
    userId: integer('user_id', { mode: 'number' })
      .notNull()
      .references(() => userTbl.id, {
        onUpdate: 'cascade',
        onDelete: 'cascade',
      }),
  },
  (tbl) => ({
    uniqueUserUrl: unique('uq_user_urls').on(tbl.userId, tbl.url),
  }),
)

export const insertUrlSchema = createInsertSchema(urlTbl, {
  url: (schema) =>
    schema.url
      .url()
      .max(500) // limit url length
      .startsWith('http'), // allow only http(s) urls (not ftp, etc.)
})

export const insertUrlRequestSchema = insertUrlSchema.pick({ url: true })

// Example of relations
// export const urlsRelations = relations(url, ({ one }) => ({
//     author: one(user, {
//         fields: [url.userId],
//         references: [user.id],
//     }),
// }))
