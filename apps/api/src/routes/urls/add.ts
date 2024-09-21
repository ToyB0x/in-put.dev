import { createFactory } from 'hono/factory'
import { zValidator } from '@hono/zod-validator'
import { insertUrlRequestSchema, url } from '@repo/database'
import { getDB, verifyIdToken } from '../../libs'
import { getUserFromDB } from '../../libs/getUserFromDB'
import { sql } from 'drizzle-orm'

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

  // TODO: return count and show Store on extension
  await db
    .insert(url)
    .values({ url: jsonUrl, pageTitle, userId: userInDb.id })
    .onConflictDoUpdate({
      target: [url.userId, url.url],
      set: { pageTitle, updatedAt: new Date(), count: sql`${url.count} + 1` },
    })

  return c.json({ success: true })
})

export const addHandler = handlers
