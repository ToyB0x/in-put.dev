import type { Auth } from 'firebase/auth/web-extension'
import { storageAllowedDomainV1 } from '@/entrypoints/storage/allowedDomain.ts'

type IconState = 'LOGGED_IN' | 'LOGGED_OUT' | 'ALLOWED_DOMAIN'

const detectIconState = async ({ auth, activeUrl }: { auth: Auth; activeUrl?: string }): Promise<IconState> => {
  const isLoggedIn = auth.currentUser
  if (!isLoggedIn) return 'LOGGED_OUT'

  if (!activeUrl) return 'LOGGED_IN'

  const isAllowedDomain = (await storageAllowedDomainV1.getValue()).includes(new URL(activeUrl).hostname)
  if (isAllowedDomain) return 'ALLOWED_DOMAIN'
  else return 'LOGGED_IN'
}

// Iconが色々な箇所から、様々な内容で更新されるとバグの元なので、現在の状態から一意なアイコン状態に更新するための処理をまとめた関数
export const updateIcon = async ({ auth, activeUrl }: { auth: Auth; activeUrl?: string }) => {
  const iconState = await detectIconState({ auth, activeUrl })
  switch (iconState) {
    case 'LOGGED_OUT':
      await browser.action.setBadgeText({ text: null })
      await browser.action.setIcon({ path: 'icon/icon32.png' })
      break
    case 'LOGGED_IN':
      await browser.action.setBadgeText({ text: null })
      await browser.action.setIcon({ path: 'icon/green/icon32.png' })
      break
    case 'ALLOWED_DOMAIN':
      await browser.action.setBadgeText({ text: '✅' })
      await browser.action.setIcon({ path: 'icon/green/icon32.png' })
      break
    default:
      const _exhaustiveCheck: never = iconState
      throw Error(_exhaustiveCheck)
  }
}
