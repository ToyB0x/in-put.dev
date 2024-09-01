import { Hono } from 'hono'
import { drizzle } from 'drizzle-orm/d1'
import { users } from '@repo/database'

const app = new Hono<{ Bindings: Env }>()

app.get('/', async (c) => {
  const db = drizzle(c.env.DB_TEST1)
  const result = await db.select().from(users).all()

  return c.json({ message: 'Hello Hono!', result })
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
