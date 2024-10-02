import { storageAllowedDomainV1 } from '@/entrypoints/storage/allowedDomain'
import { storageURLv1 } from '@/entrypoints/storage/url'
import { auth } from '@/entrypoints/libs/auth'
import { getNormalizedUrl } from '@/entrypoints/libs/getNormalizedUrl'

type IconState = 'LOGGED_IN' | 'LOGGED_OUT' | 'ALLOWED_DOMAIN' | 'MARKED_URL'

export const detectIconState = async ({ activeUrl }: { activeUrl?: string }): Promise<IconState> => {
  const isLoggedIn = auth.currentUser
  if (!isLoggedIn) return 'LOGGED_OUT'

  if (!activeUrl) return 'LOGGED_IN'

  const isMarkedDomain = (await storageURLv1.getValue())
    .filter(({ isMarked }) => isMarked)
    .map(({ url }) => url)
    .includes(getNormalizedUrl(activeUrl))
  if (isMarkedDomain) return 'MARKED_URL'

  const isAllowedDomain = (await storageAllowedDomainV1.getValue()).includes(new URL(activeUrl).hostname)
  if (isAllowedDomain) return 'ALLOWED_DOMAIN'
  else return 'LOGGED_IN'
}

// Iconが色々な箇所から、様々な内容で更新されるとバグの元なので、現在の状態から一意なアイコン状態に更新するための処理をまとめた関数
export const updateIcon = async ({ activeUrl }: { activeUrl?: string }) => {
  const iconState = await detectIconState({ activeUrl })
  switch (iconState) {
    case 'LOGGED_OUT':
      await browser.action.setBadgeText({ text: null })
      await browser.action.setIcon({ path: 'icon/icon32.png' })
      break
    case 'LOGGED_IN':
      await browser.action.setBadgeText({ text: null })
      await browser.action.setIcon({ path: 'icon/icon32.png' })
      break
    case 'ALLOWED_DOMAIN':
      await browser.action.setBadgeText({ text: null })
      await browser.action.setIcon({ path: 'icon/green/icon32.png' })
      break
    case 'MARKED_URL':
      await browser.action.setBadgeText({ text: '✅' })
      await browser.action.setIcon({ path: 'icon/green/icon32.png' })
      break
    default:
      const _exhaustiveCheck: never = iconState
      throw Error(_exhaustiveCheck)
  }
}
