import { json, type MetaFunction, type LoaderFunctionArgs } from '@remix-run/cloudflare'
import { useLoaderData } from '@remix-run/react'
import { drizzle } from 'drizzle-orm/d1'
import { urls } from '@repo/database'

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
  const result = await db.select().from(urls).all()

  const message = 'Hello from the loader'
  return json({ message, result })
}

export default function Index() {
  const { result } = useLoaderData<typeof loader>()
  const uniqueHosts = [...new Set(result.map((url) => new URL(url.url).host))]

  return (
    <div className='font-sans p-8'>
      <h1 className='text-4xl'>Input.dev</h1>
      <ol className='mt-2'>
        {uniqueHosts.sort().map((host) => (
          <li key={host} className='p-2 py-4'>
            <p>
              {host}
              <ol className='ml-8 list-disc'>
                {result
                  .filter((url) => new URL(url.url).host === host)
                  .map((url) => (
                    <li key={url.id}>{decodeURIComponent(url.url)}</li>
                  ))}
              </ol>
            </p>
          </li>
        ))}
      </ol>
    </div>
  )
}
