import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './schema',
  dialect: 'sqlite',
})
