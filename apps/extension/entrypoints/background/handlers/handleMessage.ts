import { signInWithEmailAndPassword } from 'firebase/auth/web-extension'
import { auth } from '@/entrypoints/libs/auth'
import type { LoginMessage, LoginResponse } from '@/entrypoints/messages/login'

export const handleMessage = () =>
  // Register Login event
  browser.runtime.onMessage.addListener(async (message) => {
    // TODO: validate message by valibot
    const messageTyped: LoginMessage = message
    const result = await signInWithEmailAndPassword(auth, messageTyped.data.email, messageTyped.data.password)
    const response: LoginResponse = { type: 'login', success: true, data: { user: result.user } }
    return response
  })
