import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth/web-extension'
import { sharedPublicViteEnv } from '@repo/env/shared'
import {
  handleIconClick,
  handleLoadUrl,
  handleMessage,
  handleTabChange,
  updateIcon,
  registerIconMenu,
} from './handlers'

const firebaseAppBrowser = initializeApp({
  projectId: sharedPublicViteEnv.VITE_PUBLIC_FIREBASE_PROJECT_ID,
  apiKey: sharedPublicViteEnv.VITE_PUBLIC_FIREBASE_BROWSER_API_KEY,
})

const auth = getAuth(firebaseAppBrowser)

export default defineBackground(() => {
  handleTabChange()
  handleIconClick(auth)
  handleLoadUrl(auth)
  handleMessage(auth)
  registerIconMenu(auth)

  // Register Auth state change event
  auth.onAuthStateChanged(async (user) => {
    // initialize icon ui
    await updateIcon({ auth })

    // update icon menu
    await browser.action.setPopup({
      popup: user
        ? '' // blank string means no popup
        : 'popup-menu.html',
    })
  })
})
