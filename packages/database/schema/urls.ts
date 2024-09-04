import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'
import { users } from './users'
import { createInsertSchema } from 'drizzle-zod'

export const urls = sqliteTable(
  'urls',
  {
    id: integer('id').primaryKey(),
    url: text('url').notNull(),
    pageTitle: text('pageTitle'),
    createdAt: text('createdAt')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updatedAt')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    userId: integer('userId')
      .notNull()
      .references(() => users.id, {
        onUpdate: 'cascade',
        onDelete: 'cascade',
      }),
  },
  (urls) => ({
    urlIdx: uniqueIndex('urlIdx').on(urls.userId, urls.url),
  }),
)

export const insertUrlSchema = createInsertSchema(urls, {
  url: (schema) =>
    schema.url
      .url()
      .max(500) // limit url length
      .startsWith('http'), // allow only http(s) urls (not ftp, etc.)
})

export const insertUrlRequestSchema = insertUrlSchema.pick({ url: true })
