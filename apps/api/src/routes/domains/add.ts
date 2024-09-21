import { createFactory } from 'hono/factory'
import { zValidator } from '@hono/zod-validator'
import { getDB, verifyIdToken } from '../../libs'
import { getUserFromDB } from '../../libs/getUserFromDB'
import { allowedDomainTbl, insertAllowedDomainRequestSchema } from '@repo/database'

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
    .insert(allowedDomainTbl)
    .values({ domain, userId: userInDb.id })
    .onConflictDoUpdate({
      target: [allowedDomainTbl.userId, allowedDomainTbl.domain],
      set: { isDisabled: false, updatedAt: new Date() },
    })

  return c.json({ success: true, message: 'data added successfully' })
})

export const addHandler = handlers
