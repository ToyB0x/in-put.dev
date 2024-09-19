import type { User } from 'firebase/auth'

export type LoginMessage = {
  type: 'login'
  data: {
    email: string
    password: string
  }
}

export type Response = {
  type: 'login'
  success: boolean
  data: {
    user: User | null
  }
}
