import { Auth, WorkersKVStoreSingle } from 'firebase-auth-cloudflare-workers'
import type { FirebaseOptions } from 'firebase/app'
import { sharedPublicViteEnv } from '@repo/env/shared'

// Your web app's Firebase configuration
// ref: https://stackoverflow.com/a/37484053
const firebaseConfig = {
  projectId: sharedPublicViteEnv.VITE_PUBLIC_FIREBASE_PROJECT_ID,
  apiKey: sharedPublicViteEnv.VITE_PUBLIC_FIREBASE_BROWSER_API_KEY, // public browser endpoint
} satisfies FirebaseOptions

// NOTE: Avoid wrong kid error
// const dummyStore = {
//   get: async () => null,
//   put: async () => undefined,
// }

export const getOrInitializeAuth = async (env: Env) =>
  Auth.getOrInitialize(
    firebaseConfig.projectId,
    WorkersKVStoreSingle.getOrInitialize(env.KV_INPUTS_PUBLIC_JWK_CACHE_KEY, env.KV_INPUTS_PUBLIC_JWK_CACHE),
  )
