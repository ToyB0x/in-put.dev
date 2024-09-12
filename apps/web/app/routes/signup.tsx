import { unstable_defineAction, type MetaFunction, type LoaderFunctionArgs } from '@remix-run/cloudflare'
import { redirect } from '@remix-run/react'
import {
  authCookie,
  AuthCookieValues,
  cookieOption,
  firebaseSessionCookieExpiresIn,
  getOrInitializeAuth,
} from '@/.server'
import { SignupFromBrowser } from '@/components'
import { insertUserSchema, user } from '@repo/database'
import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'

export const meta: MetaFunction = () => {
  return [{ title: 'Input.dev' }]
}

export const action = unstable_defineAction(async ({ context, request }: LoaderFunctionArgs) => {
  const formData = await request.formData()
  const userName = formData.get('userName')
  if (typeof userName !== 'string') throw Error('userName is invalid')

  const idToken = formData.get('idToken')
  if (typeof idToken !== 'string') throw Error('idToken is invalid')

  const refreshToken = formData.get('refreshToken')
  if (typeof refreshToken !== 'string') throw Error('refreshToken is invalid')

  // validate token
  const auth = await getOrInitializeAuth(context.cloudflare.env)
  const verifiedResult = await auth.verifyIdToken(idToken)

  // insert user to db
  const sql = neon(context.cloudflare.env.SECRETS_DATABASE_URL)
  const db = drizzle(sql)
  const parseUserResult = insertUserSchema.safeParse({
    userName,
    displayName: userName,
    email: verifiedResult.email,
    firebaseUid: verifiedResult.uid,
  })

  if (!parseUserResult.success) throw { message: 'Invalid user info given', status: 400 }

  await db.insert(user).values(parseUserResult.data)

  const generatedSessionCookie = await auth.createSessionCookie(idToken, { expiresIn: firebaseSessionCookieExpiresIn })
  const cookieValues = {
    sessionCookie: generatedSessionCookie,
    refreshToken,
  } satisfies AuthCookieValues

  // set to cookie and redirect user page
  return redirect(`/@${userName}`, {
    headers: {
      'Set-Cookie': await authCookie.serialize(cookieValues, cookieOption),
    },
  })
})

// TODO: refactor / add ui component
export default function Page() {
  return <SignupFromBrowser />
}
