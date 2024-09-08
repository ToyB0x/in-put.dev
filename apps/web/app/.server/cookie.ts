import { createCookie } from '@remix-run/cloudflare'

export const authCookie = createCookie('auth', {
  maxAge: 604_800, // one week
})
