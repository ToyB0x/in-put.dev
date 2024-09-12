/**
 * This file is workaround for cloudflare pages can't read env without context (embed public envs on build step by vite)
 * Don't commit PRIVATE envs (If you need to add PRIVATE envs, add them from cloudflare console page or via like .dev.vars file so that they are not exposed to the public)
 */

// NOTE: CloudFlare Pages does not support multiple environments (like dev, stg, prd), only supports preview and production environments
export type CLOUD_FLARE_PAGES_MODE = 'preview' | 'production'

const viteMode = import.meta.env.MODE as 'development' | 'production' // ref: https://ja.vitejs.dev/guide/env-and-mode
export const PUBLIC_CLOUDFLARE_PAGES_MODE: CLOUD_FLARE_PAGES_MODE = viteMode === 'production' ? 'production' : 'preview'

export const PUBLIC_FIREBASE_BROWSER_API_KEY_PREVIEW = import.meta.env.VITE_PUBLIC_FIREBASE_BROWSER_API_KEY_PREVIEW
export const PUBLIC_FIREBASE_BROWSER_API_KEY_PRODUCTION = import.meta.env
  .VITE_PUBLIC_FIREBASE_BROWSER_API_KEY_PRODUCTION
