import { domainTbl } from '@repo/database'
import { and, eq } from 'drizzle-orm'
import { createFactory } from 'hono/factory'
import { getDB, verifyIdToken } from '../../libs'
import { getUserFromDB } from '../../libs/getUserFromDB'

const factory = createFactory()

const handlers = factory.createHandlers(async (c) => {
  const db = getDB(c)

  const { uid } = await verifyIdToken(c)
  const user = await getUserFromDB(uid, db)

  const domains = await db
    .select({ domain: domainTbl.domain })
    .from(domainTbl)
    .where(and(eq(domainTbl.userId, user.id), eq(domainTbl.isDisabled, false)))

  return c.json({ domains: domains.map((r) => r.domain) })
})

export const getEnabledHandler = handlers
