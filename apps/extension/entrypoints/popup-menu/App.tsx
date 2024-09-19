import { FormEventHandler, useState } from 'react'
import reactLogo from '@/assets/react.svg'
import wxtLogo from '/wxt.svg'
import './App.css'
import type { User } from 'firebase/auth'
import type { LoginMessage, LoginResponse } from '@/entrypoints/messages'

function App() {
  const [count, setCount] = useState(0)
  const [user, setUser] = useState<User | null>(null)

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const email = form.get('email')
    const password = form.get('password')

    if (typeof email !== 'string' || typeof password !== 'string') throw Error('invalid inputs')

    const message: LoginMessage = {
      type: 'login',
      data: {
        email,
        password,
      },
    }

    const response: LoginResponse = await browser.runtime.sendMessage(message)
    if (!response.success) throw Error('failed to login')

    setUser(response.data.user)
  }

  // Logged in UI
  if (user) {
    return <p>current user: {user.email}</p>
  }

  // Logged out UI
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
    </>
  )
}

export default App
