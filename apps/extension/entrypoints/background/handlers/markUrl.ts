import { getPureUrl } from '@/entrypoints/libs/getPureUrl'
import { client } from '@/entrypoints/libs/apiClient'
import { auth } from '@/entrypoints/libs/auth'

export const markUrl = async ({ url, isMarked }: { url: string; isMarked: boolean }) => {
  if (!auth.currentUser) {
    console.warn('no user logged in')
    return
  }

  const token = await auth.currentUser.getIdToken()
  if (!token) throw Error('no token')

  await client.urls.mark.$post({ json: { url: getPureUrl(url), isMarked } }, { headers: { Authorization: 'Bearer ' + token } })
}
