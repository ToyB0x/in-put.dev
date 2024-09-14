import { defineConfig } from 'drizzle-kit'
import * as dotenv from 'dotenv'

if (process.env.NEON_BRANCH === 'MAIN') dotenv.config({ path: '../../.env.production.local' })
else dotenv.config({ path: '../../.env.development.local' })

const dbUrl = process.env.NEON_DATABASE_URL
if (!dbUrl) throw Error('Database URL not found')

export default defineConfig({
  schema: './schema',
  dialect: 'postgresql',
  strict: true,
  verbose: true,
  dbCredentials: {
    url: dbUrl,
  },
})
