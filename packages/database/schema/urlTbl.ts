import { sql } from 'drizzle-orm'
import { integer, sqliteTable, text, unique } from 'drizzle-orm/sqlite-core'
import { userTbl } from './userTbl'
import { createInsertSchema } from 'drizzle-zod'
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
  url: (schema) =>
    schema.url
      .url()
      .max(500) // limit url length
      .startsWith('http') // allow only http(s) urls (not ftp, etc.)
      .transform((url) => {
        // normalize url
        const u = new URL(url)
        u.hash = '' // remove hash
        u.search = '' // remove query

        // TODO: execute more normalize on client side.
        // eg, remove last slack for treat "path/to/doc/" same as "path/to/doc"
        // (but database should record same url user bookmarked)
        return u.toString()
      }),
})

export const insertUrlRequestSchema = insertUrlSchema.pick({ url: true, pageTitle: true })

// Example of relations
// export const urlsRelations = relations(url, ({ one }) => ({
//     author: one(user, {
//         fields: [url.userId],
//         references: [user.id],
//     }),
// }))
