import { hc } from 'hono/client'
import type { AppType } from '@repo/api'
import { sharedPublicViteEnv } from '@repo/env/shared'

const client = hc<AppType>(sharedPublicViteEnv.VITE_PUBLIC_API_SERVER_URL + '/')

export default client
