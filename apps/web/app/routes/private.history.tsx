import { type LoaderFunctionArgs, type MetaFunction } from '@remix-run/cloudflare'
import { useLoaderData } from '@remix-run/react'
import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import { url, user } from '@repo/database'
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

  const sql = neon(context.cloudflare.env.SECRETS_DATABASE_URL)
  const db = drizzle(sql)

  return await db
    .select({
      url: url.url,
      count: url.count,
      updatedAt: url.updatedAt,
    })
    .from(user)
    .orderBy(desc(url.updatedAt))
    .innerJoin(url, eq(user.id, url.userId))
    .where(eq(user.firebaseUid, verifiedResult.uid))
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
