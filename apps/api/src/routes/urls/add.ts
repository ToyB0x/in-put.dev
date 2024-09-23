import { createFactory } from 'hono/factory'
import { vValidator } from '@hono/valibot-validator'
import { domainTbl, insertUrlRequestSchema, urlTbl } from '@repo/database'
import { getDB, verifyIdToken } from '../../libs'
import { getUserFromDB } from '../../libs/getUserFromDB'
import { and, eq, sql } from 'drizzle-orm'

const factory = createFactory()

const validator = vValidator('json', insertUrlRequestSchema, (result, c) => {
  if (!result.success) {
    return c.json({ message: 'invalid data given' }, 400)
  }
})

const handlers = factory.createHandlers(validator, async (c) => {
  const db = getDB(c)
  const { url, pageTitle } = c.req.valid('json')

  const { uid } = await verifyIdToken(c)
  const user = await getUserFromDB(uid, db)

  const domain = new URL(url).hostname

  // TODO: use tx
  const [domainInDb] = await db
    .select({ id: domainTbl.id })
    .from(domainTbl)
    .where(and(eq(domainTbl.userId, user.id), eq(domainTbl.domain, domain)))

  const domainId = domainInDb?.id
  if (!domainId) throw Error('domain record id invalid')

  // TODO: return count and show Store on extension
  await db
    .insert(urlTbl)
    .values({ url, pageTitle, domainId, userId: user.id })
    .onConflictDoUpdate({
      target: [urlTbl.userId, urlTbl.url],
      set: { pageTitle, count: sql`${urlTbl.count} + 1` },
    })

  return c.json({ success: true })
})

export const addHandler = handlers
