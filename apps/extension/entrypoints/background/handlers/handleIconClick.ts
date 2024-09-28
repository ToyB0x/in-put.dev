import client from '@/entrypoints/libs/client'
import type { Auth } from 'firebase/auth/web-extension'
import { storageAllowedDomainV1 } from '@/entrypoints/storage/allowedDomain.ts'
import { detectIconState, updateIcon } from './updateIcon.ts'
import { upsertUrl } from './upsertUrl.ts'
import { markUrl } from './markUrl.ts'
import { syncData } from '@/entrypoints/background/handlers/syncData.ts'
import { updateIconAndContentWithStorageData } from '@/entrypoints/background/handlers/updateIconAndContentWithStorageData.ts'

// type ClickIconAction =
//   | 'ALLOW_DOMAIN' // initial state
//   | 'MARK_URL' // when allowed domain
//   // | 'DISABLE_DOMAIN' // by context menu (can't provide as icon click action because ui used as mark enable / disable action)
//   | 'UNMARK_URL' // when marked url

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
    const iconState = await detectIconState({ auth, activeUrl })

    // allow domain action
    if (iconState === 'LOGGED_IN') {
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

      await upsertUrl({ auth, url: activeUrl, title: activeTitle })
    }

    // MARK URL
    if (iconState === 'ALLOWED_DOMAIN') {
      console.warn('ALLOWED_DOMAIN')
      // TODO: refactor to post api once
      await upsertUrl({ auth, url: activeUrl, title: activeTitle })
      await markUrl({ url: activeUrl, isMarked: true })
    }

    if (iconState === 'MARKED_URL') {
      console.warn('MARKED_URL')
      await markUrl({ url: activeUrl, isMarked: false })
    }

    await syncData()
    await updateIconAndContentWithStorageData()

    const activeTabHost = new URL(activeUrl).host
    const relatedTabs = await browser.tabs.query({ url: `*://${activeTabHost}/*` })

    // NOTE: Caution! This ignores error message
    await Promise.allSettled(
      relatedTabs.map((tab) => tab.id && browser.tabs.sendMessage(tab.id, { type: 'store-updated' })),
    )
  })
