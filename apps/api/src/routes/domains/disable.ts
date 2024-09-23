import { createFactory } from 'hono/factory'
import { vValidator } from '@hono/valibot-validator'
import { getDB, verifyIdToken } from '../../libs'
import { getUserFromDB } from '../../libs/getUserFromDB'
import { domainTbl, insertDomainRequestSchema } from '@repo/database'
import { and, eq } from 'drizzle-orm'

const factory = createFactory()

const validator = vValidator('json', insertDomainRequestSchema, (result, c) => {
  if (!result.success) {
    return c.json({ success: false, message: 'invalid data given' }, 400)
  }
})

const handlers = factory.createHandlers(validator, async (c) => {
  const db = getDB(c)
  const { domain } = c.req.valid('json')

  const { uid } = await verifyIdToken(c)
  const user = await getUserFromDB(uid, db)

  await db
    .update(domainTbl)
    .set({ isDisabled: true })
    .where(and(eq(domainTbl.userId, user.id), eq(domainTbl.domain, domain)))

  return c.json({ success: true, message: 'data deleted successfully' })
})

export const disableHandler = handlers
