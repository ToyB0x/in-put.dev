import { storageBookmarkV1 } from '@/entrypoints/storage/bookmark'
import { getPureUrl } from '@/entrypoints/libs/getPureUrl'
import client from '@/entrypoints/libs/client'
import type { Auth } from 'firebase/auth/web-extension'

// Register icon click event
export const handleIconClick = (auth: Auth) =>
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
