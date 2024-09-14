/**
 * Embed public envs on build step by vite
 * Don't commit PRIVATE envs (If you need to add PRIVATE envs, add them from cloudflare console page or via .dev.vars file)
 */

import * as v from 'valibot'

const sharedPublicViteEnvSchema = v.object({
  MODE: v.union([v.literal('development'), v.literal('production')]), // ref: https://ja.vitejs.dev/guide/env-and-mode
  VITE_PUBLIC_FIREBASE_PROJECT_ID: v.string(),
  VITE_PUBLIC_FIREBASE_BROWSER_API_KEY: v.string(), // public browser key
})

export const sharedPublicViteEnv = v.parse(sharedPublicViteEnvSchema, import.meta.env)
