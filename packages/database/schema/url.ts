import { createInsertSchema } from 'drizzle-zod'
import { pgTable, boolean, integer, smallint, serial, uniqueIndex, timestamp, varchar } from 'drizzle-orm/pg-core'
import { user } from './user'
import { allowedDomainTbl } from './allowedDomain'

export const url = pgTable(
  'url',
  {
    id: serial('id').primaryKey(), // not use uuid because cloudflare d1 sqlite doesn't support uuid
    url: varchar('url', { length: 256 * 4 }).notNull(),
    pageTitle: varchar('pageTitle', { length: 256 }),
    count: smallint('count').notNull().default(1), // use small int (max 32767)
    isDisabled: boolean('isDisabled').notNull().default(false), // logical delete bookmark but not physical delete record for avoid accidental count reset
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
    userId: integer('userId')
      .notNull()
      .references(() => user.id, {
        onUpdate: 'cascade',
        onDelete: 'cascade',
      }),
    allowedDomainId: integer('allowedDomainId')
      .notNull() // enable after migration
      .references(() => allowedDomainTbl.id, {
        onUpdate: 'cascade',
        onDelete: 'cascade',
      }),
  },
  (url) => ({
    urlIdx: uniqueIndex('urlIdx').on(url.userId, url.url),
    // urlHashIdx: index('urlHashIdx').using('hash', url.url), // 必要に応じてハッシュインデックスを追加し高速化する
  }),
)

export const insertUrlSchema = createInsertSchema(url, {
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
