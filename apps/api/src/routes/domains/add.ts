import { createFactory } from 'hono/factory'
import { vValidator } from '@hono/valibot-validator'
import { getDB, verifyIdToken } from '../../libs'
import { getUserFromDB } from '../../libs/getUserFromDB'
import { domainTbl, insertDomainRequestSchema } from '@repo/database'

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
    .insert(domainTbl)
    .values({ domain, userId: user.id })
    .onConflictDoUpdate({
      target: [domainTbl.userId, domainTbl.domain],
      set: {
        isDisabled: false, // treat as enabled
      },
    })

  return c.json({ success: true, message: 'data added successfully' })
})

export const addHandler = handlers
