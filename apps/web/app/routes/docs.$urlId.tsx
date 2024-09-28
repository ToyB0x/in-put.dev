import { json, type MetaFunction, type LoaderFunctionArgs } from '@remix-run/cloudflare'
import { useLoaderData } from '@remix-run/react'
import { drizzle } from 'drizzle-orm/d1'
import { urlTbl, userTbl } from '@repo/database'
import { eq } from 'drizzle-orm'

export const meta: MetaFunction = () => {
  return [{ title: 'Readx' }]
}

export const loader = async ({ context, params }: LoaderFunctionArgs) => {
  const db = drizzle(context.cloudflare.env.DB_INPUTS)

  const { urlId } = params
  if (!urlId) throw Error('no url exist')

  const result = await db
    .select({
      url: urlTbl.url,
      user: userTbl.name,
    })
    .from(urlTbl)
    .innerJoin(userTbl, eq(urlTbl.userId, userTbl.id))
    .where(eq(urlTbl.id, Number(urlId)))

  if (!result) throw Error('no user exist')

  console.log(result)

  return json({ result })
}

export default function Index() {
  const { result } = useLoaderData<typeof loader>()
  return <>{JSON.stringify(result, null, 2)}</>
}
