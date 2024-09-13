import {
  type CLOUD_FLARE_PAGES_MODE,
  PUBLIC_CLOUDFLARE_PAGES_MODE,
  PUBLIC_FIREBASE_BROWSER_API_KEY_PREVIEW,
  PUBLIC_FIREBASE_BROWSER_API_KEY_PRODUCTION,
} from '@/env-public'
import {
  Auth,
  ServiceAccountCredential,
  WorkersKVStoreSingle,
  type FirebaseIdToken,
} from 'firebase-auth-cloudflare-workers'
import { firebaseSessionCookieExpiresIn } from '@/.server/cookie'

// Your web app's Firebase configuration
// ref: https://stackoverflow.com/a/37484053
const firebaseConfigsServer = {
  preview: {
    projectId: 'inputs-local', // map cloudflare local develop env / preview env to firebase local project
    apiKey: PUBLIC_FIREBASE_BROWSER_API_KEY_PREVIEW, // public browser endpoint
  },
  production: {
    projectId: 'inputs-prd', // map cloudflare production to firebase production project
    apiKey: PUBLIC_FIREBASE_BROWSER_API_KEY_PRODUCTION, // public browser endpoint
  },
} satisfies {
  [key in CLOUD_FLARE_PAGES_MODE]: {
    projectId: string
    apiKey: string
  }
}

const firebaseConfigServer = firebaseConfigsServer[PUBLIC_CLOUDFLARE_PAGES_MODE]

// NOTE: Avoid wrong kid error
// const dummyStore = {
//   get: async () => null,
//   put: async () => undefined,
// }

export const getOrInitializeAuth = async (env: Env) =>
  Auth.getOrInitialize(
    firebaseConfigServer.projectId,
    WorkersKVStoreSingle.getOrInitialize(env.PUBLIC_JWK_CACHE_KEY, env.PUBLIC_JWK_CACHE_KV),
    // dummyStore,
    new ServiceAccountCredential(env.SECRETS_SERVICE_ACCOUNT_JSON_STRING),
  )

export const fetchNewTokenWithRefreshToken = async (
  refreshToken: string,
): Promise<{
  idToken: string
  refreshToken: string
  expiresIn: number
}> => {
  const res = await fetch(
    // https://cloud.google.com/identity-platform/docs/use-rest-api
    `https://securetoken.googleapis.com/v1/token?key=${firebaseConfigsServer[PUBLIC_CLOUDFLARE_PAGES_MODE].apiKey}`,
    {
      method: 'POST',
      body: JSON.stringify({
        grant_type: 'refresh_token',
        refreshToken,
      }),
    },
  )

  const result = await res.json<{
    id_token: string
    refresh_token: string
    expires_in: number
  }>()

  return {
    idToken: result.id_token,
    refreshToken: result.refresh_token,
    expiresIn: result.expires_in,
  }
}

export const verifyAndUpdateSessionCookieWithTokenRefreshIfExpired = async (
  sessionCookie: string,
  refreshToken: string,
  auth: Auth,
): Promise<{
  user: FirebaseIdToken
  newSessionCookie: string // obtaion from idToken exchange
  newRefreshToken: string
}> => {
  try {
    const user = await auth.verifySessionCookie(sessionCookie)
    return {
      user,
      newSessionCookie: sessionCookie, // reuse sessionCookie if not expired
      newRefreshToken: refreshToken,
    }
  } catch (e) {
    // NOTE: handle session-cookie-expired error
    // https://firebase.google.com/docs/auth/admin/errors
    //   errorInfo: {
    //     code: 'auth/argument-error', // NOTE: Caution! not 'auth/session-cookie-expired'
    //         message: 'Decoding Firebase session cookie failed. Make sure you passed the entire string JWT which represents a session cookie. See https://firebase.google.com/docs/auth/admin/manage-cookies for details on how to retrieve a session cookie. err: Error: Incorrect "exp" (expiration time) claim must be a newer than "1726194876" (exp: "1726194492")'
    if (e instanceof Error && 'code' in e && typeof e.code === 'string' && e.code === 'auth/argument-error') {
      const { idToken, refreshToken: newRefreshToken } = await fetchNewTokenWithRefreshToken(refreshToken)
      const newSessionCookie = await auth.createSessionCookie(idToken, { expiresIn: firebaseSessionCookieExpiresIn })
      const user = await auth.verifySessionCookie(newSessionCookie)

      return {
        user,
        newSessionCookie,
        newRefreshToken,
      }
    }

    // re-throw error if not session-cookie-expired error
    throw e
  }
}
