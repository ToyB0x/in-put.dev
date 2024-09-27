import { getPureUrl } from '@/entrypoints/libs/getPureUrl'
import client from '@/entrypoints/libs/client'
import type { Auth } from 'firebase/auth/web-extension'

export const upsertUrl = async ({ auth, url, title }: { auth: Auth; url: string; title: string }) => {
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
