import client from '@/entrypoints/libs/client'
import { auth } from '@/entrypoints/background'
import { storageAllowedDomainV1 } from '@/entrypoints/storage/allowedDomain.ts'
import { storageURLv1 } from '@/entrypoints/storage/url.ts'

export const syncData = async () => {
  if (!auth.currentUser) {
    console.warn('no user logged in')
    return
  }

  const token = await auth.currentUser.getIdToken()
  if (!token) throw Error('no token')

  // update domain
  const resDomains = await client.domains['enabled-domains'].$get({}, { headers: { Authorization: 'Bearer ' + token } })
  const dataDomains = await resDomains.json()

  await storageAllowedDomainV1.setValue(dataDomains.domains)

  // update urls
  const resUrls = await client.urls.$get({}, { headers: { Authorization: 'Bearer ' + token } })
  const dataUrls = await resUrls.json()

  await storageURLv1.setValue(dataUrls)
}
