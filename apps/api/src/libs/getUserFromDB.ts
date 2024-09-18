import { user } from '@repo/database'
import { eq } from 'drizzle-orm'
import type { getDB } from './getDB'

export const getUserFromDB = async (firebaseUid: string, db: ReturnType<typeof getDB>) => {
  const userInDb = await db.query.user.findFirst({
    where: eq(user.firebaseUid, firebaseUid),
    columns: { id: true, userName: true },
  })

  if (!userInDb) throw Error('User not found')

  return userInDb
}
