import type { Context } from 'hono'
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { url, user } from '@repo/database'

export const getDB = (c: Context) => {
  const sql = neon(c.env.SECRETS_DATABASE_URL)
  return drizzle(sql, { schema: { user, url } })
}
