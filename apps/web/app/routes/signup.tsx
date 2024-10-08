import { redirect, useFetcher } from '@remix-run/react'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { getOrInitializeAuth } from '@/.server/firebase'
import { firebaseAuthBrowser } from '@/.client/firebase'
import { drizzle } from 'drizzle-orm/d1'
import { insertUserTblSchema, userTbl } from '@repo/database'
import type { MetaFunction, LoaderFunctionArgs } from '@remix-run/cloudflare'

export const meta: MetaFunction = () => {
  return [{ title: 'Readx' }]
}

export const action = async ({ context, request }: LoaderFunctionArgs) => {
  const formData = await request.formData()
  const userName = formData.get('userName')
  if (typeof userName !== 'string') throw Error('userName is invalid')

  const authHeader = request.headers.get('Authorization')
  if (!authHeader) throw Error('Authorization header is missing')
  const idToken = authHeader.replace('Bearer ', '')

  // validate token
  const auth = await getOrInitializeAuth(context.cloudflare.env)
  const verifiedResult = await auth.verifyIdToken(idToken)

  // insert user to db
  const db = drizzle(context.cloudflare.env.DB_INPUTS)

  const parseUserResult = insertUserTblSchema.safeParse({
    name: userName,
    displayName: userName,
    email: verifiedResult.email,
    firebaseUid: verifiedResult.uid,
  })

  if (!parseUserResult.success) {
    console.error(parseUserResult.error)
    throw Error('Invalid user info given')
  }

  await db.insert(userTbl).values(parseUserResult.data)

  return redirect(`/@${userName}`)
}

export default function Page() {
  const fetcher = useFetcher()

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    const formData = new FormData(e.target as HTMLFormElement)

    const userName = formData.get('userName')
    if (typeof userName !== 'string') throw Error('userName is invalid')

    const email = formData.get('email')
    if (typeof email !== 'string') throw Error('email is invalid')

    const password = formData.get('password')
    if (typeof password !== 'string') throw Error('password is invalid')

    await createUserWithEmailAndPassword(firebaseAuthBrowser, email, password)
    console.info(`User created: ${email}`)

    // workaround for wait on-auth-state-change complete on service worker
    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
    await sleep(3000)

    // Submit key/value JSON as a FormData instance
    fetcher.submit({ userName }, { method: 'POST' })
  }

  return (
    <fetcher.Form onSubmit={onSubmit} className='flex flex-col'>
      <input name='userName' type='text' placeholder='userName' />
      <input name='email' type='email' placeholder='email' />
      <input name='password' type='password' placeholder='password' />
      <button type='submit'>send</button>
    </fetcher.Form>
  )
}
