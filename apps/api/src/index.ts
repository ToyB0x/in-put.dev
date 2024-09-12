import { Hono } from 'hono'
import { drizzle } from 'drizzle-orm/neon-http'
import { insertUrlRequestSchema, url, user } from '@repo/database'
import { zValidator } from '@hono/zod-validator'
import { parse } from 'node-html-parser'
import { neon } from '@neondatabase/serverless'

const app = new Hono<{ Bindings: Env }>()

// List all url
app.get('/', async (c) => {
  const sql = neon(c.env.SECRETS_DATABASE_URL)
  const db = drizzle(sql)
  const result = await db.select().from(url)
  return c.json({ message: 'URL list', result })
})

// List all user
app.get('/users', async (c) => {
  const sql = neon(c.env.SECRETS_DATABASE_URL)
  const db = drizzle(sql)
  const result = await db.select().from(user)
  return c.json({ result })
})

// Insert user
// TODO: change to post method
// app.get('/users/new', async (c) => {
//   const db = drizzle(c.env.DB_TEST1)
//   const result = await db
//     .insert(user)
//     .values({ name: 'User1', email: 'user1@example.com' })
//     .onConflictDoNothing()
//   return c.json({ result })
// })

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
    const sql = neon(c.env.SECRETS_DATABASE_URL)
    const db = drizzle(sql)

    const { url: paramsUrl } = c.req.valid('param')
    const res = await fetch(paramsUrl)
    const html = parse(await res.text())
    const pageTitle = html.querySelector('title')?.text

    // TODO: use real user_id with authentication
    const userId = 1

    await db
      .insert(url)
      .values({ url: paramsUrl, pageTitle, userId })
      .onConflictDoUpdate({
        target: [url.userId, url.url],
        set: { pageTitle, updatedAt: new Date() },
      })
    return c.json({ message: 'Inserted', url: paramsUrl, pageTitle })
  },
)

export default app
