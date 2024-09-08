import { unstable_defineAction, type MetaFunction, type LoaderFunctionArgs } from '@remix-run/cloudflare'
import { redirect } from '@remix-run/react'
import { drizzle } from 'drizzle-orm/d1'
import { authCookie, verifyJWT } from '@/.server'
import { LoginFromBrowser } from '@/components'
import { urls, users } from '@repo/database'
import { cloudFlarePagesMode } from '@/env'
import { eq } from 'drizzle-orm'

export const meta: MetaFunction = () => {
  return [{ title: 'Input.dev' }]
}

export const action = unstable_defineAction(async ({ context, request }: LoaderFunctionArgs) => {
  const formData = await request.formData()

  const idToken = formData.get('idToken')
  if (typeof idToken !== 'string') throw Error('idToken is invalid')

  const refreshToken = formData.get('refreshToken')
  if (typeof refreshToken !== 'string') throw Error('refreshToken is invalid')

  const verifiedResult = await verifyJWT(idToken, context.cloudflare.env)

  const db = drizzle(context.cloudflare.env.DB_TEST1, { schema: { users, urls } })
  const userInDb = await db.query.users.findFirst({
    where: eq(users.firebaseUid, verifiedResult.uid),
    columns: { userName: true },
  })

  if (!userInDb) throw Error('User not found')

  // TODO: use remix-auth package
  // set to cookie and redirect user page
  return redirect(`/@${userInDb.userName}`, {
    headers: {
      'Set-Cookie': await authCookie.serialize(
        {
          idToken,
          refreshToken,
        },
        {
          httpOnly: true,
          secure: cloudFlarePagesMode === 'production',
        },
      ),
    },
  })
})

// TODO: refactor / add ui component
export default function Page() {
  return <LoginFromBrowser />
}
