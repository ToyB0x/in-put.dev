import { sql } from 'drizzle-orm'
import { integer, sqliteTable, text, unique } from 'drizzle-orm/sqlite-core'
import { userTbl } from './userTbl'
import { createInsertSchema } from 'drizzle-zod'
import { customTimestamp } from './customTimestamp'

export const domainTbl = sqliteTable(
  'domain',
  {
    id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: false }),
    domain: text('domain', { length: 253 }).notNull(),
    isDisabled: integer('is_disabled', { mode: 'boolean' }).notNull().default(false), // disable auto count domain usage (same as logical delete bookmark but not physical delete record for avoid accidental count reset)
    createdAt: customTimestamp('created_at')
      .notNull()
      .default(sql`UNIXEPOCH()`),
    updatedAt: customTimestamp('updated_at')
      .notNull()
      .default(sql`UNIXEPOCH()`)
      .$onUpdate(() => sql`UNIXEPOCH()`),
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
