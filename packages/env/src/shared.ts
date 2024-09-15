/**
 * Embed public envs on build step by vite
 * Don't commit PRIVATE envs (If you need to add PRIVATE envs, add them from cloudflare console page or via .dev.vars file)
 */

import { union, object, literal, string, parse } from "valibot"

const sharedPublicViteEnvSchema = object({
  MODE: union([literal('development'), literal('production')]), // ref: https://ja.vitejs.dev/guide/env-and-mode
  VITE_PUBLIC_FIREBASE_PROJECT_ID: string(),
  VITE_PUBLIC_FIREBASE_BROWSER_API_KEY: string(), // public browser key
})

export const sharedPublicViteEnv = parse(sharedPublicViteEnvSchema, import.meta.env)
