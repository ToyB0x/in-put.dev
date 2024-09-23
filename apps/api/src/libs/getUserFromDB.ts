import { userTbl } from '@repo/database'
import { eq } from 'drizzle-orm'
import type { getDB } from './getDB'

export const getUserFromDB = async (firebaseUid: string, db: ReturnType<typeof getDB>) => {
  const [user] = await db
    .select({ id: userTbl.id, name: userTbl.name })
    .from(userTbl)
    .where(eq(userTbl.firebaseUid, firebaseUid))

  if (!user) throw Error('User not found')

  return user
}
