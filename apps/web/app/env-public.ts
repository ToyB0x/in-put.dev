/**
 * Embed public envs on build step by vite
 * Don't commit PRIVATE envs (If you need to add PRIVATE envs, add them from cloudflare console page or via .dev.vars file)
 */

export const VITE_MODE = import.meta.env.MODE as 'development' | 'production' // ref: https://ja.vitejs.dev/guide/env-and-mode
export const VITE_PUBLIC_FIREBASE_PROJECT_ID = import.meta.env.VITE_PUBLIC_FIREBASE_PROJECT_ID as string
export const VITE_PUBLIC_FIREBASE_BROWSER_API_KEY = import.meta.env.VITE_PUBLIC_FIREBASE_BROWSER_API_KEY as string
