import { client } from '../client'
import { auth } from '@/entrypoints/libs/auth'
import { getNormalizedUrl } from '@/entrypoints/libs/getNormalizedUrl'

export const upsertUrl = async ({ url, title }: { url: string; title: string }) => {
  if (!auth.currentUser) {
    console.warn('no user logged in')
    return
  }

  const token = await auth.currentUser.getIdToken()
  if (!token) throw Error('no token')

  await client.urls.add.$post(
    {
      json: { url: getNormalizedUrl(url), pageTitle: title },
    },
    {
      headers: {
        Authorization: 'Bearer ' + token,
      },
    },
  )
}
