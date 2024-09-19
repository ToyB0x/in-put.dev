import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth/web-extension'
import { sharedPublicViteEnv } from '@repo/env/shared'
import { handleIconClick, handleMessage, handleTabChange, handleTabUpdate } from './handlers'

const firebaseAppBrowser = initializeApp({
  projectId: sharedPublicViteEnv.VITE_PUBLIC_FIREBASE_PROJECT_ID,
  apiKey: sharedPublicViteEnv.VITE_PUBLIC_FIREBASE_BROWSER_API_KEY,
})

const auth = getAuth(firebaseAppBrowser)

export default defineBackground(() => {
  handleTabChange()
  handleTabUpdate()
  handleIconClick(auth)
  handleMessage(auth)

  // Register Auth state change event
  auth.onAuthStateChanged(async (user) => {
    // reset icon text
    await browser.action.setBadgeText({ text: null })

    // update icon login status
    await browser.action.setIcon({
      path: user ? 'icons-green/icon32.png' : 'icon/icon32.png',
    })

    // update icon menu
    await browser.action.setPopup({
      popup: user
        ? '' // blank string means no popup
        : 'popup-menu.html',
    })
  })
})
