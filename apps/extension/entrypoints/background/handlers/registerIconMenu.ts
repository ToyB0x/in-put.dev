import { disableDomain, syncData } from '@/entrypoints/libs/apiClient'
import type { Auth } from 'firebase/auth/web-extension'
import { updateIconAndContentWithStorageData } from '../actions'

const contextMenuId = browser.contextMenus.create({
  title: 'sign out',
  type: 'normal',
  id: 'sign-out' + crypto.randomUUID(),
  contexts: ['action'],
})

const contextMenuDisableDomainId = browser.contextMenus.create({
  title: 'disable domain',
  type: 'normal',
  id: 'disable-domain' + crypto.randomUUID(),
  contexts: ['action'],
})

const contextMenuSyncId = browser.contextMenus.create({
  title: 'sync',
  type: 'normal',
  id: 'sync' + crypto.randomUUID(),
  contexts: ['action'],
})

// Register extension icon context menu
export const registerIconMenu = (auth: Auth) =>
  browser.contextMenus.onClicked.addListener(async (info, tab) => {
    if (!auth.currentUser) {
      console.warn('no user logged in')
      return
    }

    // Menu: Sign out
    if (info.menuItemId === contextMenuId) {
      await auth.signOut()
    }

    // Menu: Disable domain
    if (info.menuItemId === contextMenuDisableDomainId) {
      // disable domain
      const activeTabUrl = tab?.url
      if (!activeTabUrl) return
      await disableDomain(activeTabUrl)
      await syncData()
    }

    // Menu: Sync data
    if (info.menuItemId === contextMenuSyncId) {
      await syncData()
      await updateIconAndContentWithStorageData()
    }
  })
