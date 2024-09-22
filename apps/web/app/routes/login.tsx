import { useEffect, useState } from 'react'
import type { MetaFunction } from '@remix-run/cloudflare'
import { useFetcher } from '@remix-run/react'
import { firebaseAuthBrowser } from '@/.client/firebase'
import { onAuthStateChanged, signInWithEmailAndPassword, type User } from 'firebase/auth'

export const meta: MetaFunction = () => {
  return [{ title: 'Readx' }]
}

export default function Page() {
  const fetcher = useFetcher()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuthBrowser, async (user) => {
      setUser(user)
    })
    return unsubscribe
  }, [])

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    const formData = new FormData(e.target as HTMLFormElement)

    const email = formData.get('email')
    if (typeof email !== 'string') throw Error('email is invalid')

    const password = formData.get('password')
    if (typeof password !== 'string') throw Error('password is invalid')

    await signInWithEmailAndPassword(firebaseAuthBrowser, email, password)
    console.info('logged in successfully')
    location.href = '/'
  }

  return (
    <>
      <fetcher.Form onSubmit={onSubmit} className='flex flex-col'>
        <input name='email' type='email' placeholder='email' />
        <input name='password' type='password' placeholder='password' />
        <button type='submit'>send</button>
      </fetcher.Form>

      <div>current user: {user && user.email}</div>
    </>
  )
}
