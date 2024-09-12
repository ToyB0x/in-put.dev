import { createInsertSchema } from 'drizzle-zod'
import { pgTable, integer, serial, uniqueIndex, timestamp, varchar } from 'drizzle-orm/pg-core'
import { user } from './user'

export const url = pgTable(
  'urls',
  {
    id: serial('id').primaryKey(),
    url: varchar('url', { length: 256 * 4 }).notNull(),
    pageTitle: varchar('pageTitle', { length: 256 }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
    userId: integer('userId')
      .notNull()
      .references(() => user.id, {
        onUpdate: 'cascade',
        onDelete: 'cascade',
      }),
  },
  (urls) => ({
    urlIdx: uniqueIndex('urlIdx').on(urls.userId, urls.url),
  }),
)

export const insertUrlSchema = createInsertSchema(url, {
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
