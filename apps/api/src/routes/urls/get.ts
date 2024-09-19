import { url } from '@repo/database'
import { eq } from 'drizzle-orm'
import { createFactory } from 'hono/factory'
import { getDB, verifyIdToken } from '../../libs'
import { getUserFromDB } from '../../libs/getUserFromDB'

const factory = createFactory()

const handlers = factory.createHandlers(async (c) => {
  const db = getDB(c)

  const { uid } = await verifyIdToken(c)
  const userInDb = await getUserFromDB(uid, db)

  const result = await db.select({ url: url.url }).from(url).where(eq(url.userId, userInDb.id))
  return c.json({ urls: result.map((r) => r.url) })
})

export const getUrlsHandler = handlers
