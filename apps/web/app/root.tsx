import { Links, Meta, Outlet, Scripts, ScrollRestoration } from '@remix-run/react'
import './tailwind.css'

export function Layout({ children }: { children: React.ReactNode }) {
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
          <div className='w-[480px] min-h-screen bg-[#FCFCFC]'>{children}</div>
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
