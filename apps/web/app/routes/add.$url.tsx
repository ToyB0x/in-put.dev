import { redirect } from '@remix-run/react'
import { json, type MetaFunction, type LoaderFunctionArgs } from '@remix-run/cloudflare'
import { eq } from 'drizzle-orm'
import { parse } from 'node-html-parser'
import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import { insertUrlRequestSchema, url, user } from '@repo/database'
import {
  authCookie,
  AuthCookieValues,
  cookieOption,
  getOrInitializeAuth,
  verifyAndUpdateSessionCookieWithTokenRefreshIfExpired,
} from '@/.server'

export const meta: MetaFunction = () => {
  return [{ title: 'Readx' }]
}

export const loader = async ({ context, request, params }: LoaderFunctionArgs) => {
  // validate token
  const cookieHeader = request.headers.get('Cookie')
  const cookie = await authCookie.parse(cookieHeader)

  const sessionCookie = cookie.sessionCookie
  const refreshToken = cookie.refreshToken

  const auth = await getOrInitializeAuth(context.cloudflare.env)
  const {
    user: firebaseUser,
    newSessionCookie,
    newRefreshToken,
  } = await verifyAndUpdateSessionCookieWithTokenRefreshIfExpired(sessionCookie, refreshToken, auth)

  const parseUrlResult = insertUrlRequestSchema.safeParse({ url: params.url })
  if (!parseUrlResult.success) {
    return json({ message: 'Invalid url given', status: 400 })
  }

  const res = await fetch(parseUrlResult.data.url)
  const html = parse(await res.text())
  const pageTitle = html.querySelector('title')?.text

  // insert url to db and redirect user page
  const sql = neon(context.cloudflare.env.SECRETS_DATABASE_URL)
  const db = drizzle(sql, { schema: { user } })

  const userInDb = await db.query.user.findFirst({
    where: eq(user.firebaseUid, firebaseUser.uid),
    columns: { id: true, userName: true },
  })

  if (!userInDb) throw Error('User not found')

  await db
    .insert(url)
    .values({ url: parseUrlResult.data.url, pageTitle, userId: userInDb.id })
    .onConflictDoUpdate({
      target: [url.userId, url.url],
      set: { pageTitle, updatedAt: new Date() },
    })

  const cookieValues = {
    sessionCookie: newSessionCookie,
    refreshToken: newRefreshToken,
  } satisfies AuthCookieValues

  return redirect(`/@${userInDb.userName}/?url=${parseUrlResult.data.url}`, {
    headers: {
      'Set-Cookie': await authCookie.serialize(cookieValues, cookieOption),
    },
  })
}

// NOTE:
// Worker bookmarklet
// javascript:(function()%7B(function() %7B%0A    var baseURL %3D 'https%3A%2F%2Fapi-test1.xxxxxxxxxxxxxxxxx.workers.dev'%3B%0A    var url %3D baseURL %2B '%2Fadd%2F' %2B encodeURIComponent(location.href)%3B%0A    window.open(url%2C '_blank').focus()%3B%0A%7D)()%3B%7D)()%3B
// Remix bookmarklet
// javascript:(function()%7B(function() %7B%0A    var baseURL %3D 'https%3A%2F%2Fin-put.dev'%3B%0A    var url %3D baseURL %2B '%2Fadd%2F' %2B encodeURIComponent(location.href)%3B%0A    window.open(url%2C '_blank').focus()%3B%0A%7D)()%3B%7D)()%3B
