import client from '@/entrypoints/libs/client'
import { storageAllowedDomainV1 } from '@/entrypoints/storage/allowedDomain'
import { updateIcon } from './updateIcon'
import type { Auth } from 'firebase/auth/web-extension'
import { storageURLv1 } from '@/entrypoints/storage/url.ts'

const contextMenuId = browser.contextMenus.create({
  title: 'sign out',
  type: 'normal',
  id: 'sign-out' + crypto.randomUUID(),
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

      // update domain
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

      // update urls
      const resUrls = await client.urls.$get(
        {},
        {
          headers: {
            Authorization: 'Bearer ' + token,
          },
        },
      )
      const dataUrls = await resUrls.json()

      await storageURLv1.setValue(dataUrls)

      // update icon menu ui
      const [activeTab] = await browser.tabs.query({ active: true, currentWindow: true })
      const activeUrl = activeTab.url
      await updateIcon({
        auth,
        activeUrl,
      })

      // update content script ui
      if (!activeTab.id) return
      await browser.tabs.sendMessage(activeTab.id, { type: 'store-updated' })
    }
  })
