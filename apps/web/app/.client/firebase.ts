import { initializeApp, type FirebaseOptions } from 'firebase/app'
import { getAuth, inMemoryPersistence } from 'firebase/auth'
import { VITE_PUBLIC_FIREBASE_BROWSER_API_KEY, VITE_PUBLIC_FIREBASE_PROJECT_ID } from '@/env-public'

// Your web app's Firebase configuration
// ref: https://stackoverflow.com/a/37484053
const firebaseConfigsBrowser = {
  projectId: VITE_PUBLIC_FIREBASE_PROJECT_ID,
  apiKey: VITE_PUBLIC_FIREBASE_BROWSER_API_KEY, // public browser endpoint
} satisfies FirebaseOptions

const firebaseAppBrowser = initializeApp(firebaseConfigsBrowser)

export const PersistenceNone = inMemoryPersistence
export const firebaseAuthBrowser = getAuth(firebaseAppBrowser)
