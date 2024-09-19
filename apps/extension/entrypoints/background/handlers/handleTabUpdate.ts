import { storageBookmarkV1 } from '@/entrypoints/storage/bookmark'
import { getPureUrl } from '@/entrypoints/libs/getPureUrl'

// onUpdated: Handle tab update event (eg: url change)
export const handleTabUpdate = () =>
  browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    const [activeTab] = await browser.tabs.query({ active: true, currentWindow: true })
    if (tabId !== activeTab.id) return

    const activeUrl = tab.url
    if (!activeUrl) return

    const hasBookmarked = (await storageBookmarkV1.getValue()).includes(getPureUrl(activeUrl))
    await browser.action.setBadgeText({ text: hasBookmarked ? '✅' : null })
  })
