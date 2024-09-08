import { getApp, getApps, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { type CLOUD_FLARE_PAGES_MODE, cloudFlarePagesMode } from '@/env'

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

const firebaseAppServer =
  getApps().length === 0
    ? initializeApp(firebaseConfigsServer[cloudFlarePagesMode]) // map cloudflare local develop env / preview env to firebase local project
    : getApp()

export const firebaseAuthServer = getAuth(firebaseAppServer)
