import { storageAllowedDomainV1 } from '@/entrypoints/storage/allowedDomain'
import { updateIcon } from '../actions'
import type { Auth } from 'firebase/auth/web-extension'

// onActivated: Handle tab change event
// > Fires when the active tab in a window changes. Note that the tab's URL may not be set at the time this event fired, but you can listen to tabs.onUpdated events to be notified when a URL is set.
// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/onActivated
export const handleTabChange = (auth: Auth) =>
  browser.tabs.onActivated.addListener(async (activeInfo) => {
    const tab = await browser.tabs.get(activeInfo.tabId)
    const activeUrl = tab.url
    if (!activeUrl) return

    const hasBookmarked = (await storageAllowedDomainV1.getValue()).includes(new URL(activeUrl).hostname)
    await updateIcon({ auth, activeUrl })
  })
