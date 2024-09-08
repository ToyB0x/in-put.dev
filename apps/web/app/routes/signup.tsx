import { unstable_defineAction, type MetaFunction, type LoaderFunctionArgs } from '@remix-run/cloudflare'
import { redirect } from '@remix-run/react'
import { drizzle } from 'drizzle-orm/d1'
import { authCookie, firebaseConfigServer } from '@/.server'
import { SignupFromBrowser } from '@/components'
import { insertUserSchema, users } from '@repo/database'
import { cloudFlarePagesMode } from '@/env'

import { Auth, WorkersKVStoreSingle } from 'firebase-auth-cloudflare-workers'

const verifyJWT = async (
  idToken: string,
  firebaseProjectId: string,
  env: {
    PUBLIC_JWK_CACHE_KEY: string
    PUBLIC_JWK_CACHE_KV: KVNamespace
  },
) => {
  const auth = Auth.getOrInitialize(
    firebaseProjectId,
    WorkersKVStoreSingle.getOrInitialize(env.PUBLIC_JWK_CACHE_KEY, env.PUBLIC_JWK_CACHE_KV),
  )
  return await auth.verifyIdToken(idToken)
}

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
  const verifiedResult = await verifyJWT(idToken, firebaseConfigServer.projectId, context.cloudflare.env)

  // insert user to db
  const db = drizzle(context.cloudflare.env.DB_TEST1)
  const parseUserResult = insertUserSchema.safeParse({
    userName,
    displayName: userName,
    email: verifiedResult.email,
    firebaseUid: verifiedResult.uid,
  })

  if (!parseUserResult.success) throw { message: 'Invalid user info given', status: 400 }

  // TODO: handle intermediate state (created in firebase but not in db)
  await db.insert(users).values(parseUserResult.data)

  // TODO: use remix-auth package
  // set to cookie and redirect user page
  return redirect(`/@${userName}`, {
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
  return <SignupFromBrowser />
}
