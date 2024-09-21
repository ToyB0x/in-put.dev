import { storageBookmarkV1 } from '@/entrypoints/storage/bookmark'
import { getPureUrl } from '@/entrypoints/libs/getPureUrl'
import client from '@/entrypoints/libs/client'
import type { Auth } from 'firebase/auth/web-extension'

// Register icon click event
export const handleIconClick = (auth: Auth) =>
  browser.action.onClicked.addListener(async () => {
    // TODO: open popup if not logged in
    if (!auth.currentUser) {
      console.warn('no user logged in')
      return
    }

    const token = await auth.currentUser?.getIdToken()
    if (!token) throw Error('no token')

    const [activeTab] = await browser.tabs.query({ active: true, currentWindow: true })
    const activeUrl = activeTab.url
    if (!activeUrl) {
      console.warn('no active tab')
      return
    }

    if (!activeUrl.startsWith('http://') && !activeUrl.startsWith('https://')) {
      console.warn('not http(s) protocol')
      return
    }

    const activeTitle = activeTab.title
    if (!activeTitle) {
      console.warn('no active tab title')
      return
    }

    // TODO: refactor (split code)
    const clickIconAction: 'ADD' | 'REMOVE' = (await storageBookmarkV1.getValue()).includes(getPureUrl(activeUrl))
      ? 'REMOVE'
      : 'ADD'
    console.info('clickIconAction: ', clickIconAction)

    // optimistic update
    await browser.action.setBadgeText({ text: clickIconAction === 'ADD' ? '✅' : null })

    if (clickIconAction === 'ADD') {
      const resDomainAdd = await client.domains.add.$post(
        {
          json: { domain: new URL(activeUrl).hostname },
        },
        {
          headers: {
            Authorization: 'Bearer ' + token,
          },
        },
      )

      const dataResDomainAdd = await resDomainAdd.json()

      if (!dataResDomainAdd.success) throw Error('failed to add domain')

      const resUrlAdd = await client.urls.add.$post(
        {
          json: { url: getPureUrl(activeUrl), pageTitle: activeTitle },
        },
        {
          headers: {
            Authorization: 'Bearer ' + token,
          },
        },
      )
      const dataUrlAdd = await resUrlAdd.json()

      // fallback optimistic update
      await browser.action.setBadgeText({ text: dataUrlAdd.success ? '✅' : null })
    } else {
      const resDomainDisable = await client.domains.disable.$post(
        {
          json: { domain: new URL(activeUrl).hostname },
        },
        {
          headers: {
            Authorization: 'Bearer ' + token,
          },
        },
      )

      const dataResDomainDisable = await resDomainDisable.json()

      // fallback optimistic update
      await browser.action.setBadgeText({ text: dataResDomainDisable.success ? null : '✅' })

      if (!dataResDomainDisable.success) throw Error('failed to disable domain')
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
