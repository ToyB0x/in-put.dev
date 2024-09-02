import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'
import { users } from './users'

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
