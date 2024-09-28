import { disableDomain, syncData } from '@/entrypoints/libs/apiClient'
import { updateIconAndContentWithStorageData } from '../actions'
import { auth } from '@/entrypoints/libs/auth'

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

const contextMenuFindUserByDomainId = browser.contextMenus.create({
  title: 'find user by domain',
  type: 'normal',
  id: 'find-user-by-domain' + crypto.randomUUID(),
  contexts: ['action'],
})

const contextMenuFindUserByUrlId = browser.contextMenus.create({
  title: 'find user by url',
  type: 'normal',
  id: 'find-user-by-url' + crypto.randomUUID(),
  contexts: ['action'],
})

const contextMenuSyncId = browser.contextMenus.create({
  title: 'sync',
  type: 'normal',
  id: 'sync' + crypto.randomUUID(),
  contexts: ['action'],
})

// Register extension icon context menu
export const registerIconMenu = () =>
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

    // Menu: Find User by url
    if (info.menuItemId === contextMenuFindUserByDomainId) {
      // disable domain
      const activeTabUrl = tab?.url
      if (!activeTabUrl) return
      await browser.tabs.create({ url: 'http://localhost:5173/docs/domain/1' })
    }

    // Menu: Find User by url
    if (info.menuItemId === contextMenuFindUserByUrlId) {
      // disable domain
      const activeTabUrl = tab?.url
      if (!activeTabUrl) return
      await browser.tabs.create({ url: 'http://localhost:5173/docs/18' })
    }

    // Menu: Sync data
    if (info.menuItemId === contextMenuSyncId) {
      await syncData()
      await updateIconAndContentWithStorageData()
    }
  })
