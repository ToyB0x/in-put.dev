import { Auth, WorkersKVStoreSingle } from 'firebase-auth-cloudflare-workers'

export const getOrInitializeAuth = async (env: Env) =>
  Auth.getOrInitialize(
    env.PUBLIC_FIREBASE_PROJECT_ID,
    WorkersKVStoreSingle.getOrInitialize(env.KV_INPUTS_PUBLIC_JWK_CACHE_KEY, env.KV_INPUTS_PUBLIC_JWK_CACHE),
  )
