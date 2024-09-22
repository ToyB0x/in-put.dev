import { getAuth } from 'firebase/auth'
import { initializeApp, type FirebaseOptions } from 'firebase/app'
import { sharedPublicViteEnv } from '@repo/env/shared'

// Your web app's Firebase configuration
// ref: https://stackoverflow.com/a/37484053
const firebaseConfigsBrowser = {
  projectId: sharedPublicViteEnv.VITE_PUBLIC_FIREBASE_PROJECT_ID,
  apiKey: sharedPublicViteEnv.VITE_PUBLIC_FIREBASE_BROWSER_API_KEY, // public browser endpoint
} satisfies FirebaseOptions

const firebaseAppBrowser = initializeApp(firebaseConfigsBrowser)

export const firebaseAuthBrowser = getAuth(firebaseAppBrowser)
