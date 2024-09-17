import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { url } from '../schema'
import { eq } from 'drizzle-orm'

const dbUrl = 'YOUR_DB_URL'

const main = async () => {
  const sql = neon(dbUrl)
  const db = drizzle(sql, { schema: { url } })
  const urls = await db.select().from(url)

  // NOTE: use for await because normalized record possibly violate unique constraint and then remove record
  for (const u of urls) {
    const urlObj = new URL(u.url)
    urlObj.hash = ''
    urlObj.search = ''
    const normalizedUrl = urlObj.toString()

    try {
      await db.update(url).set({ url: normalizedUrl }).where(eq(url.id, u.id))
    } catch (e) {
      if (e instanceof Error && 'code' in e && e.code === '23505') {
        await db.delete(url).where(eq(url.id, u.id))
      }
    }
  }
}

main()
