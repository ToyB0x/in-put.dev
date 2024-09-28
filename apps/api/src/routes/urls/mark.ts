import { createFactory } from 'hono/factory'
import { zValidator } from '@hono/zod-validator'
import { updateMarkUrlRequestSchema, urlTbl } from '@repo/database'
import { getDB, verifyIdToken } from '../../libs'
import { getUserFromDB } from '../../libs/getUserFromDB'
import { and, eq } from 'drizzle-orm'

const factory = createFactory()

const validator = zValidator('json', updateMarkUrlRequestSchema, (result, c) => {
  if (!result.success) {
    return c.json({ message: 'invalid data given' }, 400)
  }
})

const handlers = factory.createHandlers(validator, async (c) => {
  const db = getDB(c)
  const { url, isMarked } = c.req.valid('json')

  const { uid } = await verifyIdToken(c)
  const user = await getUserFromDB(uid, db)

  await db
    .update(urlTbl)
    .set({ isMarked })
    .where(and(eq(urlTbl.userId, user.id), eq(urlTbl.url, url)))

  return c.json({ success: true })
})

export const markHandler = handlers
