import { client, syncData } from '@/entrypoints/libs/apiClient'
import { storageAllowedDomainV1 } from '@/entrypoints/storage/allowedDomain'
import type { Auth } from 'firebase/auth/web-extension'
import { updateIconAndContentWithStorageData } from './updateIconAndContentWithStorageData.ts'

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
      const token = await auth.currentUser?.getIdToken()
      if (!token) throw Error('no token')

      // disable domain
      const activeTabUrl = tab?.url
      if (!activeTabUrl) return
      const resDomainDisable = await client.domains.disable.$post(
        {
          json: { domain: new URL(activeTabUrl).hostname },
        },
        { headers: { Authorization: 'Bearer ' + token } },
      )

      const dataResDomainDisable = await resDomainDisable.json()
      if (!dataResDomainDisable.success) throw Error('failed to disable domain')

      await syncData()
    }

    // Menu: Sync data
    if (info.menuItemId === contextMenuSyncId) {
      await syncData()
      await updateIconAndContentWithStorageData()
    }
  })
