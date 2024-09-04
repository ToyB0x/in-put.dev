import { useState } from 'react'
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
    const matchedUrlsSorted = matchedUrls.sort((a, b) => a.url.localeCompare(b.url))
    return { host, urls: matchedUrlsSorted }
  })

  return (
    <div className='font-sans p-8'>
      <h1 className='text-4xl'>Input.dev</h1>
      {uniqueHostsWithUrls
        .sort((a, b) => {
          const diffBookmark = b.urls.length - a.urls.length
          if (diffBookmark !== 0) return diffBookmark
          return a.host.length - b.host.length
        })
        .map(({ host, urls }) => (
          <Details host={host} urls={urls} key={host} />
        ))}
    </div>
  )
}

const Details = ({ host, urls }: { host: string; urls: { url: string; pageTitle: string | null }[] }) => {
  const [showTitle, setShowTitle] = useState(false)

  return (
    <details className='my-2'>
      <summary>
        {host} {'★'.repeat(urls.length)}
      </summary>
      <ol className='ml-8'>
        {urls.map((url, i) => (
          <li key={url.url}>
            {showTitle ? url.pageTitle : new URL(decodeURIComponent(url.url)).pathname}
            {i === urls.length - 1 && (
              <button
                className='ml-2'
                onClick={() => {
                  setShowTitle(!showTitle)
                }}
              >
                {showTitle ? '(show url)' : ' (show title)'}
              </button>
            )}
          </li>
        ))}
      </ol>
    </details>
  )
}
