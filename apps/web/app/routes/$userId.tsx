import { json, type MetaFunction, type LoaderFunctionArgs } from '@remix-run/cloudflare'
import { useLoaderData, useParams } from '@remix-run/react'
import { drizzle } from 'drizzle-orm/d1'
import { domainTbl, urlTbl, userTbl } from '@repo/database'
import { and, eq } from 'drizzle-orm'

export const meta: MetaFunction = () => {
  return [{ title: 'Readx' }]
}

export const loader = async ({ context, params }: LoaderFunctionArgs) => {
  if (!params.userId) throw Error('no user exist')

  const exactUserId = params.userId.split('@')[1]
  if (!exactUserId) throw Error('no user exist')

  const db = drizzle(context.cloudflare.env.DB_INPUTS)

  const result = await db
    .select({
      url: urlTbl.url,
      count: urlTbl.count,
      pageTitle: urlTbl.pageTitle,
    })
    .from(userTbl)
    .innerJoin(domainTbl, eq(userTbl.id, domainTbl.userId))
    .innerJoin(urlTbl, eq(domainTbl.id, urlTbl.domainId))
    .where(and(eq(userTbl.name, exactUserId), eq(domainTbl.isDisabled, false)))

  if (!result) throw Error('no user exist')

  return json({ result, exactUserId })
}

export default function Index() {
  const { result, exactUserId } = useLoaderData<typeof loader>()
  // const [searchParams] = useSearchParams()
  const { userId } = useParams()

  if (!userId) return <>no user exist</>
  // const bookmakingUrl = searchParams.get('url')
  // const bookMarkingHost = bookmakingUrl ? new URL(bookmakingUrl).host : null
  const uniqueHosts = [...new Set(result.map(({ url }) => new URL(url).host))]
  const uniqueHostsWithUrls = uniqueHosts.map((host) => {
    const matchedUrls = result.filter(({ url }) => new URL(url).host === host)
    const matchedUrlsSorted = matchedUrls.sort((a, b) => a.url.localeCompare(b.url))
    return { host, urls: matchedUrlsSorted }
  })

  if (uniqueHostsWithUrls.length === 0)
    return (
      <div className='font-sans px-8'>
        <h1 className='text-4xl pt-4 pb-2'>Let&apos;s add your knowledge</h1>
        <p>how to add... (help page WIP)</p>
      </div>
    )

  return (
    <div className='font-sans px-4'>
      <h1 className='font-medium text-[1.5rem] text-xl pt-6 pb-2'>{exactUserId} read</h1>
      <div className='flex justify-end gap-2 text-[14px] text-gray-500 underline underline-offset-1 mb-4'>
        <div>Tech</div>
        <div>Life</div>
        <div>Art</div>
        <div>About</div>
        {/*<div>Docs</div>*/}
        {/*<div>Works (eg, github)</div>*/}
        {/*<div>Articles</div>*/}
        {/*<div>About</div>*/}
      </div>
      {/*<h1 className='text-4xl pt-4 pb-2'>read</h1>*/}
      {uniqueHostsWithUrls
        .sort((a, b) => {
          const diffBookmark = b.urls.length - a.urls.length
          if (diffBookmark !== 0) return diffBookmark
          return a.host.length - b.host.length
        })
        .map(({ host, urls }) => (
          <Details2 host={host} urls={urls} key={host} />
        ))}
    </div>
  )
}

const Details2 = ({
  host,
  urls,
}: {
  host: string
  urls: { url: string; count: number; pageTitle: string | null }[]
}) => {
  return (
    <>
      <div>{host}</div>
      <p className='text-sm text-gray-500'>
        {urls.reduce((acc, url) => acc + url.count, 0)} read / {urls.length} docs
      </p>
      <hr className='my-2' />
    </>
  )
}

// const Details = ({
//   host,
//   bookMarkingHost,
//   urls,
// }: {
//   host: string
//   bookMarkingHost: string | null
//   urls: { url: string; pageTitle: string | null }[]
// }) => {
//   const [showTitle, setShowTitle] = useState(false)
//
//   return (
//     <details className='my-2'>
//       <summary>
//         {host}{' '}
//         {urls.map((url, i) => (
//           <span key={i}>
//             {/* show + on bookmarked host's last star */}
//             {bookMarkingHost === host && i === urls.length - 1 && <span>+</span>}
//             {/* color bookmarked host's last star */}
//             <span className={bookMarkingHost === host && i === urls.length - 1 ? 'text-amber-300' : ''}>★</span>
//           </span>
//         ))}
//       </summary>
//       <ol className='ml-8'>
//         {urls.map((url) => (
//           <li key={url.url}>{showTitle ? url.pageTitle : new URL(decodeURIComponent(url.url)).pathname}</li>
//         ))}
//         <li>
//           <button
//             onClick={() => {
//               setShowTitle(!showTitle)
//             }}
//           >
//             {showTitle ? '(show url)' : ' (show title)'}
//           </button>
//         </li>
//       </ol>
//     </details>
//   )
// }
