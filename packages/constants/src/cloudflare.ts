// NOTE: CloudFlare Pages does not support multiple environments (like dev, stg, prd)
// only supports preview and production environments
export type CLOUD_FLARE_PAGES_MODE = 'preview' | 'production'

export const cloudFlarePagesMode = import.meta.env.VITE_PUBLIC_CLOUD_FLARE_PAGES_MODE as CLOUD_FLARE_PAGES_MODE
