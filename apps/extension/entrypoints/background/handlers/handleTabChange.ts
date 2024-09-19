import { storageBookmarkV1 } from '@/entrypoints/storage/bookmark'
import { getPureUrl } from '@/entrypoints/libs/getPureUrl'

// onActivated: Handle tab change event
// > Fires when the active tab in a window changes. Note that the tab's URL may not be set at the time this event fired, but you can listen to tabs.onUpdated events to be notified when a URL is set.
// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/onActivated
export const handleTabChange = () =>
  browser.tabs.onActivated.addListener(async (activeInfo) => {
    const tab = await browser.tabs.get(activeInfo.tabId)
    const activeUrl = tab.url
    if (!activeUrl) return

    const hasBookmarked = (await storageBookmarkV1.getValue()).includes(getPureUrl(activeUrl))
    await browser.action.setBadgeText({ text: hasBookmarked ? '✅' : null })
  })
