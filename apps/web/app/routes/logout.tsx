import type { MetaFunction } from '@remix-run/cloudflare'
import { signOut } from 'firebase/auth'
import { firebaseAuthBrowser } from '@/.client/firebase'

export const meta: MetaFunction = () => {
  return [{ title: 'Readx' }]
}

export default function Page() {
  const onSubmit = async () => {
    await signOut(firebaseAuthBrowser)
    console.info('Logged out')
  }

  return <button onClick={onSubmit}>logout</button>
}
