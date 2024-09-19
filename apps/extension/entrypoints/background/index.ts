import { getAuth, signInWithEmailAndPassword } from 'firebase/auth/web-extension'
import { initializeApp } from 'firebase/app'
import { sharedPublicViteEnv } from '@repo/env/shared'
import type { LoginMessage, LoginResponse } from '@/entrypoints/messages/login'
import { handleIconClick, handleTabChange, handleTabUpdate } from './handlers'

const firebaseAppBrowser = initializeApp({
  projectId: sharedPublicViteEnv.VITE_PUBLIC_FIREBASE_PROJECT_ID,
  apiKey: sharedPublicViteEnv.VITE_PUBLIC_FIREBASE_BROWSER_API_KEY,
})

const auth = getAuth(firebaseAppBrowser)

export default defineBackground(() => {
  handleTabChange()
  handleTabUpdate()
  handleIconClick(auth)

  // Register Login event
  browser.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    // TODO: validate message by valibot
    const messageTyped: LoginMessage = message
    const result = await signInWithEmailAndPassword(auth, messageTyped.data.email, messageTyped.data.password)
    const response: LoginResponse = { type: 'login', success: true, data: { user: result.user } }
    return response
  })

  // Register Auth state change event
  auth.onAuthStateChanged(async (user) => {
    await browser.action.setIcon({
      path: user ? 'icons-green/icon32.png' : 'icon/icon32.png',
    })
    await browser.action.setPopup({
      popup: user
        ? '' // blank string means no popup
        : 'popup-menu.html',
    })
    await browser.action.setBadgeText({ text: null })
  })
})
