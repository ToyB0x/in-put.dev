import { createCookie } from '@remix-run/cloudflare'
import { cloudFlarePagesMode } from '@/env'

export type AuthCookieValues = {
  sessionCookie: string
  refreshToken: string
}

export const cookieOption = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: cloudFlarePagesMode === 'production',
}

export const authCookie = createCookie('auth')

export const firebaseSessionCookieExpiresIn = 1000 * 60 * 60 * 24 * 14 // 14 days
