import { and, eq } from 'drizzle-orm'
import { createFactory } from 'hono/factory'
import { zValidator } from '@hono/zod-validator'
import { insertUrlRequestSchema, url } from '@repo/database'
import { getDB, verifyIdToken } from '../../libs'
import { getUserFromDB } from '../../libs/getUserFromDB'

const factory = createFactory()

const validator = zValidator('json', insertUrlRequestSchema.pick({ url: true }), (result, c) => {
  if (!result.success) {
    return c.json({ message: 'invalid data given' }, 400)
  }
})

const handlers = factory.createHandlers(validator, async (c) => {
  const db = getDB(c)
  const { url: jsonUrl } = c.req.valid('json')

  const { uid } = await verifyIdToken(c)
  const userInDb = await getUserFromDB(uid, db)

  await db.delete(url).where(and(eq(url.userId, userInDb.id), eq(url.url, jsonUrl)))
  return c.json({ success: true })
})

export const deleteHandler = handlers
