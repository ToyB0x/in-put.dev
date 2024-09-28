import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth/web-extension'
import { sharedPublicViteEnv } from '@repo/env/shared'

const firebaseAppBrowser = initializeApp({
  projectId: sharedPublicViteEnv.VITE_PUBLIC_FIREBASE_PROJECT_ID,
  apiKey: sharedPublicViteEnv.VITE_PUBLIC_FIREBASE_BROWSER_API_KEY,
})

export const auth = getAuth(firebaseAppBrowser)
