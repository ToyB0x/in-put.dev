import { and, eq } from 'drizzle-orm'
import { createFactory } from 'hono/factory'
import { zValidator } from '@hono/zod-validator'
import { insertUrlRequestSchema, url } from '@repo/database'
import { getDB, verifyIdToken } from '../../libs'
import { getUserFromDB } from '../../libs/getUserFromDB'

const factory = createFactory()

const validator = zValidator('json', insertUrlRequestSchema, (result, c) => {
  if (!result.success) {
    return c.json({ message: 'invalid data given' }, 400)
  }
})

const handlers = factory.createHandlers(validator, async (c) => {
  const db = getDB(c)
  const { url: jsonUrl, pageTitle } = c.req.valid('json')

  const { uid } = await verifyIdToken(c)
  const userInDb = await getUserFromDB(uid, db)

  const result = await db
    .select({
      url: url.url,
      userId: url.userId,
      pageTitle: url.pageTitle,
    })
    .from(url)
    .where(and(eq(url.userId, userInDb.id), eq(url.url, jsonUrl)))

  const isExistAndSameTitle = result.filter((r) => r.pageTitle === pageTitle).length > 0
  if (isExistAndSameTitle) return c.json({ exists: true })

  const isExsitButDifferentTitle = result.length > 0 && result.filter((r) => r.pageTitle !== pageTitle).length === 0
  if (isExsitButDifferentTitle) {
    await db
      .update(url)
      .set({ pageTitle, updatedAt: new Date() })
      .where(and(eq(url.userId, userInDb.id), eq(url.url, jsonUrl)))
    return c.json({ exists: true })
  }

  return c.json({ exists: false })
})

export const checkExistHandler = handlers
