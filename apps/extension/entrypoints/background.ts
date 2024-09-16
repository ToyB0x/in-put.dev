import { getAuth, signInWithEmailAndPassword } from 'firebase/auth/web-extension'
import { initializeApp } from 'firebase/app'
import { sharedPublicViteEnv } from '@repo/env/shared'
import { Message, Response } from '@/entrypoints/types/message.ts'
import client from '@/entrypoints/libs/client.ts'
import { storageBookmarkV1 } from '@/entrypoints/sotrage/bookmark.ts'

const firebaseAppBrowser = initializeApp({
  projectId: sharedPublicViteEnv.VITE_PUBLIC_FIREBASE_PROJECT_ID,
  apiKey: sharedPublicViteEnv.VITE_PUBLIC_FIREBASE_BROWSER_API_KEY,
})

const auth = getAuth(firebaseAppBrowser)

export default defineBackground(() => {
  // onActivated
  // > Fires when the active tab in a window changes. Note that the tab's URL may not be set at the time this event fired, but you can listen to tabs.onUpdated events to be notified when a URL is set.
  // https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/onActivated
  browser.tabs.onActivated.addListener(async (activeInfo) => {
    console.log('onActivated', activeInfo)
    const tab = await browser.tabs.get(activeInfo.tabId)
    console.log('tab', tab.url)

    if (!tab.url) return

    const token = await auth.currentUser?.getIdToken()
    if (!token) throw Error('no token')

    // TODO: rewrite with storage api
    const res = await client.urls.exist.$post(
      {
        json: { url: tab.url },
      },
      {
        headers: {
          Authorization: 'Bearer ' + token,
        },
      },
    )
    const data = await res.json()
    console.log('isBookmarked', data.exists)

    await browser.action.setBadgeText({ text: data.exists ? '✅' : null })
  })

  // handle tab update event (eg: url change)
  browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    const [activeTab] = await browser.tabs.query({ active: true, currentWindow: true })
    if (tabId !== activeTab.id) return

    if (!tab.url) return

    const token = await auth.currentUser?.getIdToken()
    if (!token) throw Error('no token')

    const res = await client.urls.exist.$post(
      {
        json: { url: tab.url },
      },
      {
        headers: {
          Authorization: 'Bearer ' + token,
        },
      },
    )
    const data = await res.json()
    console.log('isBookmarked', data.exists)

    await browser.action.setBadgeText({ text: data.exists ? '✅' : null })
  })

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

    // optimistic update
    await browser.action.setBadgeText({ text: '✅' })

    const resAdd = await client.urls.add.$post(
      {
        json: { url: activeUrl, pageTitle: activeTitle },
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

    const resBookmarks = await client.urls.$get(
      {},
      {
        headers: {
          Authorization: 'Bearer ' + token,
        },
      },
    )
    const dataBookmarks = await resBookmarks.json()
    console.log('dataBookmarks', dataBookmarks)

    await storageBookmarkV1.setValue(dataBookmarks.urls)

    if (!activeTab.id) throw Error('no active tab id')

    await browser.tabs.sendMessage(activeTab.id, { type: 'store-updated' })
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
