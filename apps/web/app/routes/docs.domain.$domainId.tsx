import { json, type MetaFunction, type LoaderFunctionArgs } from '@remix-run/cloudflare'
import { useLoaderData } from '@remix-run/react'
import { drizzle } from 'drizzle-orm/d1'
import { domainTbl, userTbl } from '@repo/database'
import { eq } from 'drizzle-orm'

export const meta: MetaFunction = () => {
  return [{ title: 'Readx' }]
}

export const loader = async ({ context, params }: LoaderFunctionArgs) => {
  const db = drizzle(context.cloudflare.env.DB_INPUTS)

  const { domainId } = params
  if (!domainId) throw Error('no domain exist')

  const result = await db
    .select({
      domain: domainTbl.domain,
      user: userTbl.name,
    })
    .from(domainTbl)
    .innerJoin(userTbl, eq(domainTbl.userId, userTbl.id))
    .where(eq(domainTbl.id, Number(domainId)))

  if (!result) throw Error('no user exist')

  console.log(result)

  return json({ result })
}

export default function Index() {
  const { result } = useLoaderData<typeof loader>()
  return <>{JSON.stringify(result, null, 2)}</>
}
