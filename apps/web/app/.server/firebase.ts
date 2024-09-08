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

export const firebaseConfigServer = firebaseConfigsServer[cloudFlarePagesMode]
