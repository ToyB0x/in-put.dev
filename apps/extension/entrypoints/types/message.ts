import { User } from 'firebase/auth'

export type Message = {
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
