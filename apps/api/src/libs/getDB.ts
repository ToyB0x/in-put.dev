import type { Context } from 'hono'
import { drizzle } from 'drizzle-orm/d1'

export const getDB = (c: Context) => {
  return drizzle(c.env.DB_INPUTS)
}
