import { client } from '../client'
import { auth } from '@/entrypoints/libs/auth'

export const addDomain = async (url: string) => {
  if (!auth.currentUser) {
    console.warn('no user logged in')
    return
  }

  const token = await auth.currentUser.getIdToken()
  if (!token) throw Error('no token')

  const resDomainAdd = await client.domains.add.$post(
    {
      json: { domain: new URL(url).hostname },
    },
    {
      headers: {
        Authorization: 'Bearer ' + token,
      },
    },
  )

  const dataResDomainAdd = await resDomainAdd.json()

  if (!dataResDomainAdd.success) throw Error('failed to add domain')
}
