import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { user } from '../schema'
import * as dotenv from 'dotenv'

dotenv.config({ path: '../../.env.development.local' })

const dbUrl = process.env.NEON_DATABASE_URL
if (!dbUrl) throw Error('Database URL not found')

const main = async () => {
  const dbClient = postgres(dbUrl, { max: 1 })
  const db = drizzle(dbClient)

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
