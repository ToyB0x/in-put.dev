import { getPureUrl } from '@/entrypoints/libs/getPureUrl'
import client from '@/entrypoints/libs/client'
import type { Auth } from 'firebase/auth/web-extension'
import { storageAllowedDomainV1 } from '@/entrypoints/storage/allowedDomain.ts'
import { updateIcon } from '@/entrypoints/background/handlers/updateIcon.ts'

// Register icon click event
export const handleIconClick = (auth: Auth) =>
  browser.action.onClicked.addListener(async () => {
    // TODO: open popup if not logged in
    if (!auth.currentUser) {
      console.warn('no user logged in')
      return
    }

    const token = await auth.currentUser?.getIdToken()
    if (!token) throw Error('no token')

    const [activeTab] = await browser.tabs.query({ active: true, currentWindow: true })
    const activeUrl = activeTab.url
    if (!activeUrl) {
      console.warn('no active tab')
      return
    }

    if (!activeUrl.startsWith('http://') && !activeUrl.startsWith('https://')) {
      console.warn('not http(s) protocol')
      return
    }

    const activeTitle = activeTab.title
    if (!activeTitle) {
      console.warn('no active tab title')
      return
    }

    // TODO: refactor (split code)
    const clickIconAction: 'ADD' | 'REMOVE' = (await storageAllowedDomainV1.getValue()).includes(
      new URL(activeUrl).hostname,
    )
      ? 'REMOVE'
      : 'ADD'
    console.info('clickIconAction: ', clickIconAction)

    if (clickIconAction === 'ADD') {
      const resDomainAdd = await client.domains.add.$post(
        {
          json: { domain: new URL(activeUrl).hostname },
        },
        {
          headers: {
            Authorization: 'Bearer ' + token,
          },
        },
      )

      const dataResDomainAdd = await resDomainAdd.json()

      if (!dataResDomainAdd.success) throw Error('failed to add domain')

      const resUrlAdd = await client.urls.add.$post(
        {
          json: { url: getPureUrl(activeUrl), pageTitle: activeTitle },
        },
        {
          headers: {
            Authorization: 'Bearer ' + token,
          },
        },
      )
    } else {
      const resDomainDisable = await client.domains.disable.$post(
        {
          json: { domain: new URL(activeUrl).hostname },
        },
        {
          headers: {
            Authorization: 'Bearer ' + token,
          },
        },
      )

      const dataResDomainDisable = await resDomainDisable.json()
      if (!dataResDomainDisable.success) throw Error('failed to disable domain')
    }

    // update storage
    const resDomains = await client.domains.$get(
      {},
      {
        headers: {
          Authorization: 'Bearer ' + token,
        },
      },
    )
    const dataDomains = await resDomains.json()

    await storageAllowedDomainV1.setValue(dataDomains.domains)

    // update icon
    await updateIcon({ auth, activeUrl })

    // for debugging
    // await browser.tabs.sendMessage(activeTab.id!, { type: 'store-updated' })

    const activeTabHost = new URL(activeUrl).host
    const relatedTabs = await browser.tabs.query({ url: `*://${activeTabHost}/*` })

    // NOTE: Caution! This ignores error message
    await Promise.allSettled(
      relatedTabs.map((tab) => tab.id && browser.tabs.sendMessage(tab.id, { type: 'store-updated' })),
    )
  })
