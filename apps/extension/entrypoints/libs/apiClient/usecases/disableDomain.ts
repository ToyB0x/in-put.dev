import { client } from '../client'
import { auth } from '@/entrypoints/libs/auth'

export const disableDomain = async (url: string) => {
  if (!auth.currentUser) {
    console.warn('no user logged in')
    return
  }

  const token = await auth.currentUser.getIdToken()
  if (!token) throw Error('no token')

  const resDomainDisable = await client.domains.disable.$post(
    {
      json: { domain: new URL(url).hostname },
    },
    { headers: { Authorization: 'Bearer ' + token } },
  )

  const dataResDomainDisable = await resDomainDisable.json()
  if (!dataResDomainDisable.success) throw Error('failed to disable domain')
}
