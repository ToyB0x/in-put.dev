import { Hono } from 'hono'
import { drizzle } from 'drizzle-orm/d1'
import { urls, users } from '@repo/database'

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
app.get('/add/:url', async (c) => {
  const db = drizzle(c.env.DB_TEST1)

  // TODO: zod validation url type
  const url = c.req.param('url')

  // TODO: fetch title from url
  const pageTitle = 'Title1'

  // TODO: set user_id
  const userId = 1

  await db.insert(urls).values({ url, pageTitle, userId }).onConflictDoNothing()
  return c.json({ message: 'Inserted', url })
})

// import { z } from 'zod'
// import { zValidator } from '@hono/zod-validator'
// app.post(
//   '/',
//   (c) =>
//     zValidator(
//       'json',
//       z.object({
//         url: z.string().url(),
//       }),
//     ),
//   (c) => {
//     return c.json(
//       {
//         success: true,
//       },
//       201,
//     )
//   },
// )

export default app
