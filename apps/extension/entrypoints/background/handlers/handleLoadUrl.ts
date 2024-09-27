import { getPureUrl } from '@/entrypoints/libs/getPureUrl'
import client from '@/entrypoints/libs/client.ts'
import type { Auth } from 'firebase/auth/web-extension'
import { storageAllowedDomainV1 } from '@/entrypoints/storage/allowedDomain.ts'
import { updateIcon } from '@/entrypoints/background/handlers/updateIcon.ts'

// onUpdated: Handle tab update event (eg: url change)
// on browser Tab's bar url changed, send read score if it allowed domain
export const handleLoadUrl = (auth: Auth) =>
  browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    // assume this event url change
    const isUrlChangeEvent = changeInfo.url
    if (!isUrlChangeEvent) {
      // handle tab change
      const [activeTab] = await browser.tabs.query({ active: true, currentWindow: true })

      const activeTabId = activeTab?.id
      if (!activeTabId) return

      if (tabId !== activeTab.id) return

      const activeUrl = tab.url
      if (!activeUrl) return

      return await updateIcon({ auth, activeUrl })
    }

    // NOTE: may below block can refactor / replace with changeInfo.url ?
    const [activeTab] = await browser.tabs.query({ active: true, currentWindow: true })
    const activeTabId = activeTab?.id
    if (!activeTabId) return
    if (tab.id !== activeTabId) return
    const activeUrl = tab.url
    if (!activeUrl) return

    // TODO: open popup if not logged in
    if (!auth.currentUser) return

    const token = await auth.currentUser?.getIdToken()
    if (!token) throw Error('no token')

    const isAllowedDomain = (await storageAllowedDomainV1.getValue()).includes(new URL(activeUrl).hostname)
    if (!isAllowedDomain) return

    await client.urls.add.$post(
      {
        json: { url: getPureUrl(activeUrl) },
      },
      {
        headers: {
          Authorization: 'Bearer ' + token,
        },
      },
    )

    await updateIcon({ auth, activeUrl })
  })

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
