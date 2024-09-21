import { getPureUrl } from '@/entrypoints/libs/getPureUrl'
import client from '@/entrypoints/libs/client.ts'
import type { Auth } from 'firebase/auth/web-extension'

// on browser Tab's bar url changed, send read score if it allowed domain
export const handleLoadUrl = (auth: Auth) =>
  browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    // assume this event url change
    const isUrlChangeEvent = changeInfo.url
    if (!isUrlChangeEvent) return

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

    // TODO: check allowed domain before send score
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
  })
