import { client } from '../client'
import { auth } from '@/entrypoints/libs/auth'
import { getPureUrl } from '@/entrypoints/libs/getPureUrl'

export const upsertUrl = async ({ url, title }: { url: string; title: string }) => {
  if (!auth.currentUser) {
    console.warn('no user logged in')
    return
  }

  const token = await auth.currentUser.getIdToken()
  if (!token) throw Error('no token')

  await client.urls.add.$post(
    {
      json: { url: getPureUrl(url), pageTitle: title },
    },
    {
      headers: {
        Authorization: 'Bearer ' + token,
      },
    },
  )
}
