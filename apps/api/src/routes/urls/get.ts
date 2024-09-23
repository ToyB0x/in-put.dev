import { urlTbl } from '@repo/database'
import { eq } from 'drizzle-orm'
import { createFactory } from 'hono/factory'
import { getDB, verifyIdToken } from '../../libs'
import { getUserFromDB } from '../../libs/getUserFromDB'

const factory = createFactory()

const handlers = factory.createHandlers(async (c) => {
  const db = getDB(c)

  const { uid } = await verifyIdToken(c)
  const user = await getUserFromDB(uid, db)

  const urls = await db.select({ url: urlTbl.url }).from(urlTbl).where(eq(urlTbl.userId, user.id))
  return c.json({ urls: urls.map((r) => r.url) })
})

export const getUrlsHandler = handlers
