import { initializeApp, type FirebaseOptions } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { type CLOUD_FLARE_PAGES_MODE, cloudFlarePagesMode } from '@/env'

// Your web app's Firebase configuration
const firebaseConfigsBrowser = {
  preview: {
    apiKey: 'AIzaSyD8ZjJn4fI16QTrG07nab63ZUVbWBLePTo',
    projectId: 'inputs-local', // map cloudflare local develop env / preview env to firebase local project
  },
  production: {
    apiKey: 'AIzaSyBdBXr5i774tZyBl46VPmR3-4bGBgdujVM',
    projectId: 'inputs-prd', // map cloudflare production to firebase production project
  },
} satisfies { [key in CLOUD_FLARE_PAGES_MODE]: FirebaseOptions }

const firebaseAppBrowser = initializeApp(firebaseConfigsBrowser[cloudFlarePagesMode])

export const firebaseAuthBrowser = getAuth(firebaseAppBrowser)
