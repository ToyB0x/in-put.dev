import { storageAllowedDomainV1 } from '@/entrypoints/storage/allowedDomain.ts'

// onUpdated: Handle tab update event (eg: url change)
export const handleTabUpdate = () =>
  browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    const [activeTab] = await browser.tabs.query({ active: true, currentWindow: true })

    const activeTabId = activeTab?.id
    if (!activeTabId) return

    if (tabId !== activeTab.id) return

    const activeUrl = tab.url
    if (!activeUrl) return

    const hasBookmarked = (await storageAllowedDomainV1.getValue()).includes(new URL(activeUrl).hostname)
    await browser.action.setBadgeText({ text: hasBookmarked ? '✅' : null })
  })
