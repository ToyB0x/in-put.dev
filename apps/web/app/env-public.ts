/**
 * This file is workaround for cloudflare pages can't read env without context (embed public envs on build step by vite)
 * Don't commit PRIVATE envs (If you need to add PRIVATE envs, add them from cloudflare console page or via like .dev.vars file so that they are not exposed to the public)
 */

// NOTE: CloudFlare Pages does not support multiple environments (like dev, stg, prd), only supports preview and production environments
export type CLOUD_FLARE_PAGES_MODE = 'preview' | 'production'

export const PUBLIC_CLOUDFLARE_PAGES_MODE: CLOUD_FLARE_PAGES_MODE = import.meta.env.mode.production
  ? 'production'
  : 'preview'
