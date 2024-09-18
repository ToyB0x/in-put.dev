import { Hono } from 'hono'
import { drizzle } from 'drizzle-orm/neon-http'
import { insertUrlRequestSchema, url, user } from '@repo/database'
import { zValidator } from '@hono/zod-validator'
import { neon } from '@neondatabase/serverless'
import { and, eq } from 'drizzle-orm'
import { getOrInitializeAuth } from './clients'

export const urlRoute = new Hono<{ Bindings: Env }>()
  // Get bookmarked urls
  .get('/', async (c) => {
    const sql = neon(c.env.SECRETS_DATABASE_URL)
    const db = drizzle(sql, { schema: { user } })

    const authHeader = c.req.header('Authorization')
    if (!authHeader) throw Error('no auth header')
    const token = authHeader.replace('Bearer ', '')

    const authAdmin = await getOrInitializeAuth(c.env)
    const firebaseUser = await authAdmin.verifyIdToken(token)

    const userInDb = await db.query.user.findFirst({
      where: eq(user.firebaseUid, firebaseUser.uid),
      columns: { id: true, userName: true },
    })

    if (!userInDb) throw Error('User not found')

    const result = await db.select({ url: url.url }).from(url).where(eq(url.userId, userInDb.id))
    return c.json({ urls: result.map((r) => r.url) })
  })
  // Get Url Register status
  .post(
    '/exist',
    zValidator('json', insertUrlRequestSchema, (result, c) => {
      if (!result.success) {
        return c.json({ message: 'invalid data given' }, 400)
      }
    }),
    async (c) => {
      const sql = neon(c.env.SECRETS_DATABASE_URL)
      const db = drizzle(sql, { schema: { user } })

      const { url: jsonUrl, pageTitle } = c.req.valid('json')

      const authHeader = c.req.header('Authorization')
      if (!authHeader) throw Error('no auth header')
      const token = authHeader.replace('Bearer ', '')

      const authAdmin = await getOrInitializeAuth(c.env)
      const firebaseUser = await authAdmin.verifyIdToken(token)

      const userInDb = await db.query.user.findFirst({
        where: eq(user.firebaseUid, firebaseUser.uid),
        columns: { id: true, userName: true },
      })

      if (!userInDb) throw Error('User not found')

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
    },
  )
  .post(
    '/add',
    zValidator('json', insertUrlRequestSchema, (result, c) => {
      if (!result.success) {
        return c.json({ message: 'invalid data given' }, 400)
      }
    }),
    async (c) => {
      const sql = neon(c.env.SECRETS_DATABASE_URL)
      const db = drizzle(sql, { schema: { user } })

      const { url: jsonUrl, pageTitle } = c.req.valid('json')

      const authHeader = c.req.header('Authorization')
      if (!authHeader) throw Error('no auth header')
      const token = authHeader.replace('Bearer ', '')

      const authAdmin = await getOrInitializeAuth(c.env)
      const firebaseUser = await authAdmin.verifyIdToken(token)

      const userInDb = await db.query.user.findFirst({
        where: eq(user.firebaseUid, firebaseUser.uid),
        columns: { id: true, userName: true },
      })

      if (!userInDb) throw Error('User not found')

      await db
        .insert(url)
        .values({ url: jsonUrl, pageTitle, userId: userInDb.id })
        .onConflictDoUpdate({
          target: [url.userId, url.url],
          set: { pageTitle, updatedAt: new Date() },
        })

      return c.json({ success: true })
    },
  )
  .post(
    '/delete',
    zValidator('json', insertUrlRequestSchema.pick({ url: true }), (result, c) => {
      if (!result.success) {
        return c.json({ message: 'invalid data given' }, 400)
      }
    }),
    async (c) => {
      const sql = neon(c.env.SECRETS_DATABASE_URL)
      const db = drizzle(sql, { schema: { user } })

      const { url: jsonUrl } = c.req.valid('json')

      const authHeader = c.req.header('Authorization')
      if (!authHeader) throw Error('no auth header')
      const token = authHeader.replace('Bearer ', '')

      const authAdmin = await getOrInitializeAuth(c.env)
      const firebaseUser = await authAdmin.verifyIdToken(token)

      const userInDb = await db.query.user.findFirst({
        where: eq(user.firebaseUid, firebaseUser.uid),
        columns: { id: true, userName: true },
      })

      if (!userInDb) throw Error('User not found')

      await db.delete(url).where(and(eq(url.userId, userInDb.id), eq(url.url, jsonUrl)))
      return c.json({ success: true })
    },
  )
