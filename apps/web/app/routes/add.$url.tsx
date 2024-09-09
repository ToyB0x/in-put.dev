import { json, type MetaFunction, type LoaderFunctionArgs } from '@remix-run/cloudflare'
import { redirect } from '@remix-run/react'
import { drizzle } from 'drizzle-orm/d1'
import { insertUrlRequestSchema, urls, users } from '@repo/database'
import { eq, sql } from 'drizzle-orm'
import { parse } from 'node-html-parser'
import { authCookie } from '@/.server'

export const meta: MetaFunction = () => {
  return [{ title: 'Input.dev' }]
}

export const loader = async ({ context, request, params }: LoaderFunctionArgs) => {
  // validate token
  const cookieHeader = request.headers.get('Cookie')
  const cookie = await authCookie.parse(cookieHeader)
  // await useRefreshToken(cookie.refreshToken)

  // const verifiedResult = await verifyJWT(cookie.idToken, context.cloudflare.env)

  const { url } = params
  const parseUrlResult = insertUrlRequestSchema.safeParse({ url })
  if (!parseUrlResult.success) {
    return json({ message: 'Invalid url given', status: 400 })
  }

  const res = await fetch(parseUrlResult.data.url)
  const html = parse(await res.text())
  const pageTitle = html.querySelector('title')?.text

  // insert url to db and redirect user page
  const db = drizzle(context.cloudflare.env.DB_TEST1, { schema: { users, urls } })
  const userInDb = await db.query.users.findFirst({
    where: eq(users.firebaseUid, verifiedResult.uid),
    columns: { id: true, userName: true },
  })

  if (!userInDb) throw Error('User not found')

  await db
    .insert(urls)
    .values({ url: parseUrlResult.data.url, pageTitle, userId: userInDb.id })
    .onConflictDoUpdate({
      target: [urls.userId, urls.url],
      set: { pageTitle, updatedAt: sql`CURRENT_TIMESTAMP` },
    })

  return redirect(`/@${userInDb.userName}/?url=${parseUrlResult.data.url}`)
}

// NOTE:
// Worker bookmarklet
// javascript:(function()%7B(function() %7B%0A    var baseURL %3D 'https%3A%2F%2Fapi-test1.xxxxxxxxxxxxxxxxx.workers.dev'%3B%0A    var url %3D baseURL %2B '%2Fadd%2F' %2B encodeURIComponent(location.href)%3B%0A    window.open(url%2C '_blank').focus()%3B%0A%7D)()%3B%7D)()%3B
// Remix bookmarklet
// javascript:(function()%7B(function() %7B%0A    var baseURL %3D 'https%3A%2F%2Fin-put.dev'%3B%0A    var url %3D baseURL %2B '%2Fadd%2F' %2B encodeURIComponent(location.href)%3B%0A    window.open(url%2C '_blank').focus()%3B%0A%7D)()%3B%7D)()%3B
