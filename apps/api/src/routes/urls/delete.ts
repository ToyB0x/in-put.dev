import { and, eq } from 'drizzle-orm'
import { createFactory } from 'hono/factory'
import { vValidator } from '@hono/valibot-validator'
import { insertUrlRequestSchema, urlTbl } from '@repo/database'
import { getDB, verifyIdToken } from '../../libs'
import { getUserFromDB } from '../../libs/getUserFromDB'

const factory = createFactory()

const validator = vValidator('json', insertUrlRequestSchema.pick({ url: true }), (result, c) => {
  if (!result.success) {
    return c.json({ message: 'invalid data given' }, 400)
  }
})

const handlers = factory.createHandlers(validator, async (c) => {
  const db = getDB(c)
  const { url } = c.req.valid('json')

  const { uid } = await verifyIdToken(c)
  const user = await getUserFromDB(uid, db)

  await db.delete(urlTbl).where(and(eq(urlTbl.userId, user.id), eq(urlTbl.url, url)))
  return c.json({ success: true })
})

export const deleteHandler = handlers
