import client from '@/entrypoints/libs/client'
import { storageAllowedDomainV1 } from '@/entrypoints/storage/allowedDomain'
import { updateIcon } from './updateIcon'
import type { Auth } from 'firebase/auth/web-extension'

const contextMenuId = browser.contextMenus.create({
  title: 'sign out',
  type: 'normal',
  id: 'sign-out' + crypto.randomUUID(),
  contexts: ['action'],
})

const contextMenuSyncId = browser.contextMenus.create({
  title: 'sync domain',
  type: 'normal',
  id: 'sync-domain' + crypto.randomUUID(),
  contexts: ['action'],
})

// Register extension icon context menu
export const registerIconMenu = (auth: Auth) =>
  browser.contextMenus.onClicked.addListener(async (info, tab) => {
    // Menu: Sign out
    if (info.menuItemId === contextMenuId) {
      await auth.signOut()
    }

    // Menu: Sync data
    if (info.menuItemId === contextMenuSyncId) {
      if (!auth.currentUser) {
        console.warn('no user logged in')
        return
      }

      const token = await auth.currentUser?.getIdToken()
      if (!token) throw Error('no token')

      const resDomains = await client.domains['enabled-domains'].$get(
        {},
        {
          headers: {
            Authorization: 'Bearer ' + token,
          },
        },
      )
      const dataDomains = await resDomains.json()

      await storageAllowedDomainV1.setValue(dataDomains.domains)

      const [activeTab] = await browser.tabs.query({ active: true, currentWindow: true })
      const activeUrl = activeTab.url
      await updateIcon({
        auth,
        activeUrl,
      })
    }
  })
