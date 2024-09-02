import { Hono } from 'hono'
import { drizzle } from 'drizzle-orm/d1'
import { insertUrlRequestSchema, urls, users } from '@repo/database'
import { zValidator } from '@hono/zod-validator'
import { parse } from 'node-html-parser'

const app = new Hono<{ Bindings: Env }>()

// List all urls
app.get('/', async (c) => {
  const db = drizzle(c.env.DB_TEST1)
  const result = await db.select().from(urls).all()
  return c.json({ message: 'URL list', result })
})

// List all users
app.get('/users', async (c) => {
  const db = drizzle(c.env.DB_TEST1)
  const result = await db.select().from(users).all()
  return c.json({ result })
})

// Insert user
// TODO: change to post method
app.get('/users/new', async (c) => {
  const db = drizzle(c.env.DB_TEST1)
  const result = await db
    .insert(users)
    .values({ displayName: 'User1', email: 'user1@example.com' })
    .onConflictDoNothing()
  return c.json({ result })
})

// Insert url
// NOTE: Use get method for arriving user via bookmarklet
app.get(
  '/add/:url',
  zValidator('param', insertUrlRequestSchema, (result, c) => {
    if (!result.success) {
      return c.text('invalid data given', 400)
    }
  }),
  async (c) => {
    const db = drizzle(c.env.DB_TEST1)

    const { url } = c.req.valid('param')
    const res = await fetch(url)
    const html = parse(await res.text())
    const pageTitle = html.querySelector('title')?.text

    // TODO: use real user_id with authentication
    const userId = 1

    await db
      .insert(urls)
      .values({ url, pageTitle, userId })
      .onConflictDoUpdate({
        target: [urls.userId, urls.url],
        set: { pageTitle },
      })
    return c.json({ message: 'Inserted', url, pageTitle })
  },
)

export default app
