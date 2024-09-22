import { initializeApp } from 'firebase/app'
import { getAuth, onAuthStateChanged } from 'firebase/auth'

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

const auth = getAuth()
const getIdTokenPromise = () => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      unsubscribe()
      if (!user) return resolve(null)
      const idToken = await user.getIdToken()
      return resolve(idToken)
    })
  })
}

// ref: https://firebase.google.com/docs/auth/web/service-worker-sessions?hl=ja#conclusion
self.addEventListener('fetch', (event: FetchEvent) => {
  return event.respondWith(
    getIdTokenPromise().then((idToken) => {
      if (!idToken) {
        return fetch(event.request) // send original request
      }

      const isSafeRequest =
        self.location.origin === new URL(event.request.url).origin && // self url request (load remix loader)
        (self.location.protocol == 'https:' || self.location.hostname == 'localhost') // safe scheme

      if (!isSafeRequest) {
        console.warn('not safe self site request')
        return fetch(event.request) /// send original request
      }

      const newHeaders = new Headers(event.request.headers)
      newHeaders.set('Authorization', 'Bearer ' + idToken)

      const newRequest = new Request(event.request, {
        headers: newHeaders, // ref: https://stackoverflow.com/a/49579746
      })
      return fetch(newRequest)
    }),
  )
})

console.info('initialize service worker...')
