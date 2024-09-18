import { type MetaFunction, type LoaderFunctionArgs } from '@remix-run/cloudflare'
import { redirect } from '@remix-run/react'
import {
  authCookie,
  AuthCookieValues,
  cookieOption,
  firebaseSessionCookieExpiresIn,
  getOrInitializeAuth,
} from '@/.server'
import { LoginFromBrowser } from '@/components'
import { user } from '@repo/database'
import { eq } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'

export const meta: MetaFunction = () => {
  return [{ title: 'Readx' }]
}

export const action = async ({ context, request }: LoaderFunctionArgs) => {
  const formData = await request.formData()

  const idToken = formData.get('idToken')
  if (typeof idToken !== 'string') throw Error('idToken is invalid')

  const refreshToken = formData.get('refreshToken')
  if (typeof refreshToken !== 'string') throw Error('refreshToken is invalid')

  const auth = await getOrInitializeAuth(context.cloudflare.env)
  const verifiedResult = await auth.verifyIdToken(idToken)

  const sql = neon(context.cloudflare.env.SECRETS_DATABASE_URL)
  const db = drizzle(sql, { schema: { user } })

  const userInDb = await db.query.user.findFirst({
    where: eq(user.firebaseUid, verifiedResult.uid),
    columns: { userName: true },
  })

  // NOTE: handle intermediate state (created in firebase but not in db)
  if (!userInDb) return redirect('/signup-continue') // need human-readable unique userName, but firebase token has only email, so redirect to signup-continue (input userName)

  const generatedSessionCookie = await auth.createSessionCookie(idToken, { expiresIn: firebaseSessionCookieExpiresIn })
  const cookieValues = {
    sessionCookie: generatedSessionCookie,
    refreshToken,
  } satisfies AuthCookieValues

  // set to cookie and redirect user page
  return redirect(`/@${userInDb.userName}`, {
    headers: {
      'Set-Cookie': await authCookie.serialize(cookieValues, cookieOption),
    },
  })
}

// TODO: refactor / add ui component
export default function Page() {
  return <LoginFromBrowser />
}
