'use client' // for firebase browser

import { Form, useFetcher } from '@remix-run/react'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { firebaseAuthBrowser } from '@/.client'

export const SignupFromBrowser: React.FC = () => {
  const fetcher = useFetcher()

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    const formData = new FormData(e.target as HTMLFormElement)

    const userName = formData.get('userName')
    if (typeof userName !== 'string') throw Error('userName is invalid')

    const email = formData.get('email')
    if (typeof email !== 'string') throw Error('email is invalid')

    const password = formData.get('password')
    if (typeof password !== 'string') throw Error('password is invalid')

    const credential = await createUserWithEmailAndPassword(firebaseAuthBrowser, email, password)
    const { refreshToken } = credential.user
    const idToken = await credential.user.getIdToken()

    // Submit key/value JSON as a FormData instance
    fetcher.submit({ userName, idToken, refreshToken }, { method: 'POST' })
  }

  return (
    <Form onSubmit={onSubmit} className='flex flex-col'>
      <input name='userName' type='text' placeholder='userName' />
      <input name='email' type='email' placeholder='email' />
      <input name='password' type='password' placeholder='password' />
      <button type='submit'>send</button>
    </Form>
  )
}
