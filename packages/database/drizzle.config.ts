import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './schema',
  dialect: 'postgresql',
  dbCredentials: {
    // host: 'localhost',
    // port: 5433,
    // user: 'user',
    // password: 'pass',
    // database: 'inputs',
    // ssl: false, // can be boolean | "require" | "allow" | "prefer" | "verify-full" | options from node:tls

    // url: "postgresql://postgres:password@host:port/db",
    // url: "postgresql://user:pass@localhost:5433/inputs",
    url: 'postgresql://inputs_owner:Y2J9HSnaMtRd@ep-flat-grass-a1hwukb3-pooler.ap-southeast-1.aws.neon.tech/inputs?sslmode=require',
  },
  verbose: true,
  strict: true,
})
