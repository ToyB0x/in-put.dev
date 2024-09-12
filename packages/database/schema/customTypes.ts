import { customType } from 'drizzle-orm/pg-core'

// ref: https://github.com/drizzle-team/drizzle-orm/discussions/123#discussioncomment-5784420
export const citext = customType<{ data: string }>({
  dataType() {
    return 'citext'
  },
})
