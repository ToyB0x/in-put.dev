'use client' // for firebase browser

import { Form, useFetcher } from '@remix-run/react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { firebaseAuthBrowser } from '@/.client/firebase'

export const LoginFromBrowser: React.FC = () => {
  const fetcher = useFetcher()

  // TODO: don't show in url bar
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    const formData = new FormData(e.target as HTMLFormElement)

    const email = formData.get('email')
    if (typeof email !== 'string') throw Error('email is invalid')

    const password = formData.get('password')
    if (typeof password !== 'string') throw Error('password is invalid')

    const credential = await signInWithEmailAndPassword(firebaseAuthBrowser, email, password)
    const { refreshToken } = credential.user
    const idToken = await credential.user.getIdToken()

    // Submit key/value JSON as a FormData instance
    fetcher.submit({ idToken, refreshToken }, { method: 'POST' })
  }

  return (
    <Form onSubmit={onSubmit} className='flex flex-col'>
      <input name='email' type='email' placeholder='email' />
      <input name='password' type='password' placeholder='password' />
      <button type='submit'>send</button>
    </Form>
  )
}
