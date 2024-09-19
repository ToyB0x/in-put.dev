import { getAuth, signInWithEmailAndPassword } from 'firebase/auth/web-extension'
import { initializeApp } from 'firebase/app'
import { sharedPublicViteEnv } from '@repo/env/shared'
import type { LoginMessage, LoginResponse } from '@/entrypoints/messages/login'
import client from '@/entrypoints/libs/client.ts'
import { storageBookmarkV1 } from '@/entrypoints/storage/bookmark'
import { getPureUrl } from '@/entrypoints/libs/getPureUrl.ts'
import { handleTabChange, handleTabUpdate } from './handlers'

const firebaseAppBrowser = initializeApp({
  projectId: sharedPublicViteEnv.VITE_PUBLIC_FIREBASE_PROJECT_ID,
  apiKey: sharedPublicViteEnv.VITE_PUBLIC_FIREBASE_BROWSER_API_KEY,
})

const auth = getAuth(firebaseAppBrowser)

export default defineBackground(() => {
  handleTabChange()
  handleTabUpdate()

  // Register icon click event
  browser.action.onClicked.addListener(async () => {
    // TODO: open popup if not logged in
    if (!auth.currentUser) return

    const token = await auth.currentUser?.getIdToken()
    if (!token) throw Error('no token')

    const [activeTab] = await browser.tabs.query({ active: true, currentWindow: true })
    const activeUrl = activeTab.url
    if (!activeUrl) return

    const activeTitle = activeTab.title
    if (!activeTitle) return

    // TODO: refactor (split code)
    const clickIconAction: 'ADD' | 'REMOVE' = (await storageBookmarkV1.getValue()).includes(getPureUrl(activeUrl))
      ? 'REMOVE'
      : 'ADD'

    // optimistic update
    await browser.action.setBadgeText({ text: clickIconAction === 'ADD' ? '✅' : null })

    if (clickIconAction === 'ADD') {
      const resAdd = await client.urls.add.$post(
        {
          json: { url: getPureUrl(activeUrl), pageTitle: activeTitle },
        },
        {
          headers: {
            Authorization: 'Bearer ' + token,
          },
        },
      )
      const dataAdd = await resAdd.json()

      // fallback optimistic update
      await browser.action.setBadgeText({ text: dataAdd.success ? '✅' : null })
    } else {
      const resDelete = await client.urls.delete.$post(
        {
          json: { url: getPureUrl(activeUrl) },
        },
        {
          headers: {
            Authorization: 'Bearer ' + token,
          },
        },
      )
      const dataDelete = await resDelete.json()

      // fallback optimistic update
      await browser.action.setBadgeText({ text: dataDelete.success ? null : '✅' })
    }

    // update storage with updated bookmarks
    const resBookmarks = await client.urls.$get(
      {},
      {
        headers: {
          Authorization: 'Bearer ' + token,
        },
      },
    )
    const dataBookmarks = await resBookmarks.json()

    await storageBookmarkV1.setValue(dataBookmarks.urls.map(getPureUrl))

    // for debugging
    // await browser.tabs.sendMessage(activeTab.id!, { type: 'store-updated' })

    const activeTabHost = new URL(activeUrl).host
    const relatedTabs = await browser.tabs.query({ url: `*://${activeTabHost}/*` })

    // NOTE: Caution! This ignores error message
    await Promise.allSettled(
      relatedTabs.map((tab) => tab.id && browser.tabs.sendMessage(tab.id, { type: 'store-updated' })),
    )
  })

  // Register extension icon context menu
  const contextMenuId = browser.contextMenus.create({
    title: 'sign out',
    type: 'normal',
    id: 'sign-out' + crypto.randomUUID(),
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
