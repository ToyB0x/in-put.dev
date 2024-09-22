import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

initializeApp({
  projectId: import.meta.env.VITE_PUBLIC_FIREBASE_PROJECT_ID,
  apiKey: import.meta.env.VITE_PUBLIC_FIREBASE_BROWSER_API_KEY, // public browser endpoint
})

// ref: https://developer.mozilla.org/ja/docs/Web/API/Clients/claim
self.addEventListener('activate', (event) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  event.waitUntil(clients.claim())
})

// ref: https://firebase.google.com/docs/auth/web/service-worker-sessions?hl=ja#conclusion
self.addEventListener('fetch', async (event: FetchEvent) => {
  const auth = getAuth()
  const currentUser = auth.currentUser
  if (!currentUser) return // send original request

  const isSafeRequest =
    self.location.origin === new URL(event.request.url).origin &&
    (self.location.protocol == 'https:' || self.location.hostname == 'localhost')

  if (!isSafeRequest) return // send original request

  const idToken = await currentUser.getIdToken()
  const newHeaders = new Headers(event.request.headers)
  newHeaders.set('Authorization', 'Bearer ' + idToken)

  const newRequest = new Request(event.request, {
    headers: newHeaders, // ref: https://stackoverflow.com/a/49579746
  })

  event.respondWith(fetch(newRequest))
})

console.info('initialize service worker...')
