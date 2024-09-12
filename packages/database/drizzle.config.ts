import { defineConfig } from 'drizzle-kit'
import * as dotenv from 'dotenv'

dotenv.config()

const dbUrl =
  process.env.NEON_BRANCH === 'MAIN'
    ? process.env.NEON_DATABASE_URL_BRANCH_MAIN
    : process.env.NEON_DATABASE_URL_BRANCH_LOCAL
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
