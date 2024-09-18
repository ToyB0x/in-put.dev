import type { Context } from 'hono'
import { getOrInitializeAuth } from '../clients'

export const verifyIdToken = async (c: Context) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader) throw Error('no auth header')
  const token = authHeader.replace('Bearer ', '')

  const authAdmin = await getOrInitializeAuth(c.env)
  return await authAdmin.verifyIdToken(token) // return firebase user info
}
