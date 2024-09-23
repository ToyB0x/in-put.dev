import { sql } from 'drizzle-orm'
import { integer, sqliteTable, text, unique } from 'drizzle-orm/sqlite-core'
import { userTbl } from './userTbl'
import { createInsertSchema } from 'drizzle-zod'

export const domainTbl = sqliteTable(
  'domain',
  {
    id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: false }),
    domain: text('domain', { length: 253 }).notNull(),
    isDisabled: integer('is_disabled', { mode: 'boolean' }).notNull().default(false), // disable auto count domain usage (same as logical delete bookmark but not physical delete record for avoid accidental count reset)
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
    uniqueUserDomain: unique('uq_user_domains').on(tbl.userId, tbl.domain),
  }),
)

export const insertDomainSchema = createInsertSchema(domainTbl)

export const insertDomainRequestSchema = insertDomainSchema.pick({ domain: true })
