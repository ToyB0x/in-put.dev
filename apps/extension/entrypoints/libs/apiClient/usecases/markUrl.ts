import { client } from '../client'
import { auth } from '@/entrypoints/libs/auth'
import { getNormalizedUrl } from '@/entrypoints/libs/getNormalizedUrl'

export const markUrl = async ({ url, isMarked }: { url: string; isMarked: boolean }) => {
  if (!auth.currentUser) {
    console.warn('no user logged in')
    return
  }

  const token = await auth.currentUser.getIdToken()
  if (!token) throw Error('no token')

  await client.urls.mark.$post({ json: { url: getNormalizedUrl(url), isMarked } }, { headers: { Authorization: 'Bearer ' + token } })
}
