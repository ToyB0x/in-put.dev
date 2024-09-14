import { FormEventHandler, useState } from 'react'
import reactLogo from '@/assets/react.svg'
import wxtLogo from '/wxt.svg'
import './App.css'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth/web-extension'
import { initializeApp } from 'firebase/app'

const firebaseAppBrowser = initializeApp({
  projectId: 'xxx', // map cloudflare local develop env / preview env to firebase local project
  apiKey: 'yyy', // public browser endpoint
})

const auth = getAuth(firebaseAppBrowser)

function App() {
  const [count, setCount] = useState(0)

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const email = form.get('email')
    const password = form.get('password')
    const result = await signInWithEmailAndPassword(auth, email as string, password as string)
    alert(email + ' ' + password)
    alert(result.user.email)
  }

  const handleConfirmCurrentUser = async () => {
    alert(auth.currentUser?.email)
  }

  return (
    <>
      <div>
        <a href='https://wxt.dev' target='_blank'>
          <img src={wxtLogo} className='logo' alt='WXT logo' />
        </a>
        <a href='https://react.dev' target='_blank'>
          <img src={reactLogo} className='logo react' alt='React logo' />
        </a>
      </div>
      <h1>WXT + React</h1>
      <div className='card'>
        <button onClick={() => setCount((count) => count + 1)}>count is {count}</button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className='read-the-docs'>Click on the WXT and React logos to learn more</p>

      <form onSubmit={handleSubmit}>
        <input type='email' name='email' placeholder='Email' />
        <input type='password' name='password' placeholder='Password' />
        <input type='submit' value='Submit' />
      </form>

      <button onClick={handleConfirmCurrentUser}>Confirm Current User</button>
    </>
  )
}

export default App
