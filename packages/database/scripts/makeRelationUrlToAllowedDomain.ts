import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { allowedDomainTbl, url } from '../schema'
import { eq } from 'drizzle-orm'

const dbUrl = 'YOUR_DB_URL'

const main = async () => {
  const sql = neon(dbUrl)
  const db = drizzle(sql, { schema: { url, allowedDomainTbl } })
  const urls = await db.select().from(url)

  // add all domain by estimated from all records
  for (const u of urls) {
    const urlObj = new URL(u.url)
    const domain = urlObj.hostname

    await db
      .insert(allowedDomainTbl)
      .values({
        domain,
        userId: u.userId,
      })
      .onConflictDoNothing()
  }

  // relate all url to alloewdDomain
  for (const u of urls) {
    const urlObj = new URL(u.url)
    const domain = urlObj.hostname

    const allowedDomains = await db
      .select({ id: allowedDomainTbl.id })
      .from(allowedDomainTbl)
      .where(eq(allowedDomainTbl.domain, domain))

    if (allowedDomains.length !== 1) throw Error('duplicate domain already exists')

    const matchedDomain = allowedDomains[0]

    await db.update(url).set({ allowedDomainId: matchedDomain?.id })
  }
}

main()
