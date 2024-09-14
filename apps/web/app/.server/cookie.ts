import { createCookie } from '@remix-run/cloudflare'
import { sharedPublicViteEnv } from '@repo/env/shared'

export type AuthCookieValues = {
  sessionCookie: string
  refreshToken: string
}

export const cookieOption = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: sharedPublicViteEnv.MODE === 'production',
}

export const authCookie = createCookie('auth')

export const firebaseSessionCookieExpiresIn = 1000 * 60 * 60 * 24 * 14 // 14 days
