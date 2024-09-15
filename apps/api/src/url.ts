import { Hono } from 'hono'
import { drizzle } from 'drizzle-orm/neon-http'
import { insertUrlRequestSchema, url } from '@repo/database'
import { zValidator } from '@hono/zod-validator'
import { neon } from '@neondatabase/serverless'
import { and, eq } from 'drizzle-orm'

export const urlRoute = new Hono<{ Bindings: Env }>()
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
      const db = drizzle(sql)

      const { url: jsonUrl } = c.req.valid('json')

      const authHeader = c.req.header('Authorization')
      if (!authHeader) throw Error('no auth header')
      const token = authHeader.replace('Bearer ', '')
      console.log('token', token)

      // TODO: use real user_id with authentication
      const userId = 1

      const result = await db
        .select({
          url: url.url,
          userId: url.userId,
        })
        .from(url)
        .where(and(eq(url.userId, userId), eq(url.url, jsonUrl)))

      return c.json({ exists: result.length > 0 })
    },
  )
