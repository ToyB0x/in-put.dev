import type { MetaFunction } from '@remix-run/cloudflare'

export const meta: MetaFunction = () => {
  return [
    { title: 'New Remix App' },
    {
      name: 'description',
      content: 'Welcome to Remix on Cloudflare!',
    },
  ]
}

import { json } from '@remix-run/cloudflare'
import { useLoaderData } from '@remix-run/react'

export const loader = async () => {
  const message = 'Hello from the loader 2!'
  return json({ message })
}

export default function Index() {
  const { message } = useLoaderData<typeof loader>()

  return (
    <div className='font-sans p-4'>
      <h1 className='text-3xl'>Welcome to Remix on Cloudflare</h1>
      <div>message: {message}</div>
      <ul className='list-disc mt-4 pl-6 space-y-2'>
        <li>
          <a
            className='text-blue-700 underline visited:text-purple-900'
            target='_blank'
            href='https://remix.run/docs'
            rel='noreferrer'
          >
            Remix Docs
          </a>
        </li>
        <li>
          <a
            className='text-blue-700 underline visited:text-purple-900'
            target='_blank'
            href='https://developers.cloudflare.com/pages/framework-guides/deploy-a-remix-site/'
            rel='noreferrer'
          >
            Cloudflare Pages Docs - Remix guide
          </a>
        </li>
      </ul>
    </div>
  )
}
