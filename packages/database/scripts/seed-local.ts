import { user } from '../schema'
import * as dotenv from 'dotenv'
import { getDB } from '../src/getDB'

// TODO: update
dotenv.config({ path: '../../.env.development.local' })

const dbUrl = process.env.NEON_DATABASE_URL
if (!dbUrl) throw Error('Database URL not found')

const main = async () => {
  const db = getDB({ dbUrl, isRemote: false })

  // insert user
  const [insertedUser] = await db
    .insert(user)
    .values({
      userName: 'user1',
      displayName: 'user1',
      email: 'user1@example.com',
      firebaseUid: 'uid1',
    })
    .returning()

  if (!insertedUser) throw Error('User not created')
}

main()
