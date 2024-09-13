import { Hono } from 'hono'
import { drizzle } from 'drizzle-orm/d1'
import { users } from '@repo/database-d1'

const app = new Hono<{ Bindings: Env }>()

// List all urls
app.get('/', async (c) => {
  const db = drizzle(c.env.DB_TEST_API_REACT_1)
  // @ts-ignore
  const result = await db.select().from(users).all()
  return c.json(result)
})

export default app
