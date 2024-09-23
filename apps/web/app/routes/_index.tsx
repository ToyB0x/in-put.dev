import { type MetaFunction, type LoaderFunctionArgs, json } from '@remix-run/cloudflare'
import { Link, useLoaderData } from '@remix-run/react'
import { userTbl } from '@repo/database'
import { drizzle } from 'drizzle-orm/d1'

export const meta: MetaFunction = () => {
  return [{ title: 'Readx' }]
}

export const loader = async ({ context }: LoaderFunctionArgs) => {
  const db = drizzle(context.cloudflare.env.DB_INPUTS)
  const allUser = await db.select().from(userTbl)

  return json({ allUser })
}

export default function Page() {
  const { allUser } = useLoaderData<typeof loader>()

  return (
    <ul className='list-disc p-6'>
      {allUser.map(({ name }) => (
        <li key={name}>
          <Link to={`/@${name}`}>{name}</Link>
        </li>
      ))}
    </ul>
  )
}
