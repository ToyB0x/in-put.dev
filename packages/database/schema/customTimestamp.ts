import { customType } from 'drizzle-orm/sqlite-core'

// NOTE: sqlite doesn't have real date type,
// so, store timestamp as unix sec for easy sorting, comparing and reduce data size
export const customTimestamp = customType<{
  data: Date
  driverData: number
}>({
  dataType() {
    return 'integer'
  },
  // convert date to number (on save)
  toDriver(value: Date): number {
    return Math.floor(value.getTime() / 1000)
  },
  // convert number to date (on read)
  fromDriver(value: number): Date {
    return new Date(value * 1000)
  },
})
