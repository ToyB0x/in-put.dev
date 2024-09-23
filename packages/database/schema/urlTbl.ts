import { sql } from 'drizzle-orm'
import { integer, sqliteTable, text, unique } from 'drizzle-orm/sqlite-core'
import { userTbl } from './userTbl'
import { createInsertSchema } from 'drizzle-valibot'
import * as v from 'valibot'
import { domainTbl } from './domainTbl'

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
    domainId: integer('domain_id', { mode: 'number' })
      .notNull()
      .references(() => domainTbl.id, {
        onUpdate: 'cascade',
        onDelete: 'cascade',
      }),
  },
  (tbl) => ({
    uniqueUserUrl: unique('uq_user_urls').on(tbl.userId, tbl.url),
  }),
)

export const insertUrlSchema = createInsertSchema(urlTbl, {
  url: v.pipe(v.string(), v.url(), v.maxLength(500)),
})

export const insertUrlRequestSchema = insertUrlSchema.pick({ url: true })

// Example of relations
// export const urlsRelations = relations(url, ({ one }) => ({
//     author: one(user, {
//         fields: [url.userId],
//         references: [user.id],
//     }),
// }))
