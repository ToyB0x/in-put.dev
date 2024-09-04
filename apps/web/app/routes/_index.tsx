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
  const uniqueHostsWithUrls = uniqueHosts.map((host) => {
    const matchedUrls = result.filter((url) => new URL(url.url).host === host)
    return { host, matchedUrls }
  })

  return (
    <div className='font-sans p-8'>
      <h1 className='text-4xl'>Input.dev</h1>
      {uniqueHostsWithUrls
        .sort((a, b) => {
          const diffBookmark = b.matchedUrls.length - a.matchedUrls.length
          if (diffBookmark !== 0) return diffBookmark
          return a.host.length - b.host.length
        })
        .map(({ host, matchedUrls }) => (
          <details className='my-2' key={host}>
            <summary>
              {host} {'★'.repeat(matchedUrls.length)}
            </summary>
            <ol className='ml-8 list-disc'>
              {matchedUrls.map((url) => (
                <li key={url.id}>{decodeURIComponent(url.url)}</li>
              ))}
            </ol>
          </details>
        ))}
    </div>
  )
}
