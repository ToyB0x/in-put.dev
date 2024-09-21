import { createInsertSchema } from 'drizzle-zod'
import { pgTable, integer, serial, uniqueIndex, timestamp, varchar } from 'drizzle-orm/pg-core'
import { user } from './user'

// allow domain used for auto url view count
export const allowedDomainTbl = pgTable(
  'allowedDomain',
  {
    id: serial('id').primaryKey(),
    domain: varchar('domain', { length: 253 }).notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
    userId: integer('user_id')
      .notNull()
      .references(() => user.id, {
        onUpdate: 'cascade',
        onDelete: 'cascade',
      }),
  },
  (tbl) => ({
    allowedDomainUdx: uniqueIndex('allowed_domain_udx').on(tbl.userId, tbl.domain),
  }),
)

export const insertAllowedDomainSchema = createInsertSchema(allowedDomainTbl, {
  domain: (schema) => schema.domain,
})

export const insertAllowedDomainRequestSchema = insertAllowedDomainSchema.pick({ domain: true })
