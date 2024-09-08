import { type CLOUD_FLARE_PAGES_MODE, cloudFlarePagesMode } from '@/env'
import { Auth, WorkersKVStoreSingle } from 'firebase-auth-cloudflare-workers'

// Your web app's Firebase configuration
const firebaseConfigsServer = {
  preview: {
    projectId: 'inputs-local', // map cloudflare local develop env / preview env to firebase local project
  },
  production: {
    projectId: 'inputs-prd', // map cloudflare production to firebase production project
  },
} satisfies {
  [key in CLOUD_FLARE_PAGES_MODE]: {
    projectId: string
  }
}

const firebaseConfigServer = firebaseConfigsServer[cloudFlarePagesMode]

export const verifyJWT = async (
  idToken: string,
  env: {
    PUBLIC_JWK_CACHE_KEY: string
    PUBLIC_JWK_CACHE_KV: KVNamespace
  },
) => {
  const auth = Auth.getOrInitialize(
    firebaseConfigServer.projectId,
    WorkersKVStoreSingle.getOrInitialize(env.PUBLIC_JWK_CACHE_KEY, env.PUBLIC_JWK_CACHE_KV),
  )
  return await auth.verifyIdToken(idToken)
}
