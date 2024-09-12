import { createInsertSchema } from 'drizzle-zod'
import { pgTable, uniqueIndex, serial, timestamp, varchar } from 'drizzle-orm/pg-core'

export const user = pgTable(
  'user',
  {
    id: serial('id').primaryKey(),
    userName: varchar('userName', { length: 12 }).notNull(),
    displayName: varchar('displayName', { length: 24 }).notNull(),
    email: varchar('email', { length: 256 }).notNull(),
    firebaseUid: varchar('firebaseUid', { length: 36 }).notNull(), // https://stackoverflow.com/a/43911291
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (user) => ({
    userNameIdx: uniqueIndex('userName').on(user.userName),
    emailIdx: uniqueIndex('emailIdx').on(user.email),
    firebaseUidIdx: uniqueIndex('firebaseUidIdx').on(user.firebaseUid),
  }),
)
export const insertUserSchema = createInsertSchema(user)

// Example of relations
// export const userRelations = relations(user, ({ many }) => ({
//   urls: many(url),
// }))
