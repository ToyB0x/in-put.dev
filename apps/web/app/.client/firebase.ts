import { initializeApp, type FirebaseOptions } from 'firebase/app'
import { getAuth, inMemoryPersistence } from 'firebase/auth'
import {
  type CLOUD_FLARE_PAGES_MODE,
  PUBLIC_CLOUDFLARE_PAGES_MODE,
  PUBLIC_FIREBASE_BROWSER_API_KEY_PREVIEW,
  PUBLIC_FIREBASE_BROWSER_API_KEY_PRODUCTION,
} from '@/env-public'

// Your web app's Firebase configuration
// ref: https://stackoverflow.com/a/37484053
const firebaseConfigsBrowser = {
  preview: {
    projectId: 'inputs-local', // map cloudflare local develop env / preview env to firebase local project
    apiKey: PUBLIC_FIREBASE_BROWSER_API_KEY_PREVIEW, // public browser endpoint
  },
  production: {
    projectId: 'inputs-prd', // map cloudflare production to firebase production project
    apiKey: PUBLIC_FIREBASE_BROWSER_API_KEY_PRODUCTION, // public browser endpoint
  },
} satisfies { [key in CLOUD_FLARE_PAGES_MODE]: FirebaseOptions }

const firebaseAppBrowser = initializeApp(firebaseConfigsBrowser[PUBLIC_CLOUDFLARE_PAGES_MODE])

export const PersistenceNone = inMemoryPersistence
export const firebaseAuthBrowser = getAuth(firebaseAppBrowser)
