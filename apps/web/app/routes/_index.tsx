import { type MetaFunction, type LoaderFunctionArgs } from '@remix-run/cloudflare'
import { Link, useLoaderData } from '@remix-run/react'
import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import { user } from '@repo/database'

export const meta: MetaFunction = () => {
  return [{ title: 'Input.dev' }]
}

export const loader = async ({ context }: LoaderFunctionArgs) => {
  const sql = neon(context.cloudflare.env.SECRETS_DATABASE_URL)
  const db = drizzle(sql)

  const allUser = await db.select().from(user)

  return { allUser }
}

export default function Page() {
  const { allUser } = useLoaderData<typeof loader>()

  return (
    <ul className='list-disc p-6'>
      {allUser.map(({ userName }) => (
        <li key={userName}>
          <Link to={`/@${userName}`}>{userName}</Link>
        </li>
      ))}
    </ul>
  )
}
