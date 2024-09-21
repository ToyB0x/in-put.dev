import { createFactory } from 'hono/factory'
import { zValidator } from '@hono/zod-validator'
import { getDB, verifyIdToken } from '../../libs'
import { getUserFromDB } from '../../libs/getUserFromDB'
import { allowedDomainTbl, insertAllowedDomainRequestSchema, url } from '@repo/database'
import { and, eq } from 'drizzle-orm'

const factory = createFactory()

const validator = zValidator('json', insertAllowedDomainRequestSchema, (result, c) => {
  if (!result.success) {
    return c.json({ success: false, message: 'invalid data given' }, 400)
  }
})

const handlers = factory.createHandlers(validator, async (c) => {
  const db = getDB(c)
  const { domain } = c.req.valid('json')

  const { uid } = await verifyIdToken(c)
  const userInDb = await getUserFromDB(uid, db)

  await db
    .delete(allowedDomainTbl)
    .where(and(eq(allowedDomainTbl.userId, userInDb.id), eq(allowedDomainTbl.domain, domain)))

  return c.json({ success: true, message: 'data deleted successfully' })
})

export const deleteHandler = handlers
