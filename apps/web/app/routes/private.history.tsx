import { type LoaderFunctionArgs, type MetaFunction } from '@remix-run/cloudflare'
import { useLoaderData } from '@remix-run/react'
import { drizzle } from 'drizzle-orm/d1'
import { urlTbl, userTbl } from '@repo/database'
import { eq, desc } from 'drizzle-orm'
import { getOrInitializeAuth } from '@/.server'

export const meta: MetaFunction = () => {
  return [{ title: 'Readx' }]
}

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  const auth = await getOrInitializeAuth(context.cloudflare.env)

  const authHeader = request.headers.get('Authorization')
  if (!authHeader) throw Error('Authorization header is missing')

  const idToken = authHeader.replace('Bearer ', '')
  const verifiedResult = await auth.verifyIdToken(idToken)

  const db = drizzle(context.cloudflare.env.DB_INPUTS)

  return await db
    .select({
      url: urlTbl.url,
      count: urlTbl.count,
      updatedAt: urlTbl.updatedAt,
    })
    .from(userTbl)
    .orderBy(desc(urlTbl.updatedAt))
    .innerJoin(urlTbl, eq(userTbl.id, urlTbl.userId))
    .where(eq(userTbl.firebaseUid, verifiedResult.uid))
}

export default function Index() {
  const histories = useLoaderData<typeof loader>()

  return (
    <ul>
      {histories.map(({ url, count, updatedAt }) => (
        <li className='p-4' key={url}>
          <div>
            {updatedAt.toLocaleDateString()} {updatedAt.toLocaleTimeString()}
          </div>
          <div>{url}</div>
          <div>count: {count}</div>
        </li>
      ))}
    </ul>
  )
}
