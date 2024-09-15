import { getAuth, signInWithEmailAndPassword } from 'firebase/auth/web-extension'
import { initializeApp } from 'firebase/app'
import { sharedPublicViteEnv } from '@repo/env/shared'
import { Message, Response } from '@/entrypoints/types/message.ts'

const firebaseAppBrowser = initializeApp({
  projectId: sharedPublicViteEnv.VITE_PUBLIC_FIREBASE_PROJECT_ID,
  apiKey: sharedPublicViteEnv.VITE_PUBLIC_FIREBASE_BROWSER_API_KEY,
})

const auth = getAuth(firebaseAppBrowser)

export default defineBackground(() => {
  // Register icon click event
  browser.action.onClicked.addListener(async () => {
    await browser.action.setBadgeText({ text: auth.currentUser?.email || 'X' })
  })

  // Register extension icon context menu
  const contextMenuId = browser.contextMenus.create({
    title: 'sign out',
    type: 'normal',
    id: 'sign-out',
    contexts: ['action'],
  })

  // Register extension icon context menu click event
  browser.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === contextMenuId) {
      await auth.signOut()
    }
  })

  // Register Login event
  browser.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    console.log('onMessage', message + 'catch')
    // TODO: validate message by valibot
    const messageTyped: Message = message
    const result = await signInWithEmailAndPassword(auth, messageTyped.data.email, messageTyped.data.password)
    const response: Response = { type: 'login', success: true, data: { user: result.user } }
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
