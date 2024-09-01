import { json, type MetaFunction, type LoaderFunctionArgs } from '@remix-run/cloudflare'
import { useLoaderData } from '@remix-run/react'
import { drizzle } from 'drizzle-orm/d1'
import { Button } from '@repo/ui/button'
import { users } from '@repo/database'

export const meta: MetaFunction = () => {
  return [
    { title: 'New Remix App' },
    {
      name: 'description',
      content: 'Welcome to Remix on Cloudflare!',
    },
  ]
}

export const loader = async ({ context }: LoaderFunctionArgs) => {
  const db = drizzle(context.cloudflare.env.DB_TEST1)
  const result = await db.select().from(users).all()

  const message = 'Hello from the loader'
  return json({ message, result })
}

export default function Index() {
  const { message, result } = useLoaderData<typeof loader>()

  return (
    <div className='font-sans p-4'>
      <h1 className='text-3xl'>Welcome to Remix on Cloudflare</h1>
      <div>message: {message}</div>
      <div>result: {result.length}</div>
      <div>result: {JSON.stringify(result)}</div>
      <Button appName='cloudflare app' className='border'>
        Click Me!
      </Button>
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
