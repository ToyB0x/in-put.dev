import { useEffect, useState } from 'react'
import { Link, Links, Meta, Outlet, Scripts, ScrollRestoration } from '@remix-run/react'
import { firebaseAuthBrowser } from '@/.client'
import type { User } from 'firebase/auth'
import './tailwind.css'

export function Layout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const unsubscribe = firebaseAuthBrowser.onAuthStateChanged((user) => {
      setUser(user)
    })
    return unsubscribe
  })

  return (
    <html lang='en'>
      <head>
        <meta charSet='utf-8' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <link rel='icon' href='/bookmark.svg' sizes='any' type='image/svg+xml' />
        <Meta />
        <Links />
      </head>
      <body className='font-light'>
        <div className='w-full flex justify-center'>
          <div className='w-[480px] min-h-screen bg-[#FCFCFC]'>
            <div className='flex flex-col'>
              <div className='text-right p-4'>
                {user ? <Link to='/private/history'>settings</Link> : <Link to='/login'>login</Link>}
              </div>
              {children}
            </div>
          </div>
        </div>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export default function App() {
  return <Outlet />
}
