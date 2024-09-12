import { createFilter, defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import { vitePlugin as remix, cloudflareDevProxyVitePlugin as remixCloudflareDevProxy } from '@remix-run/dev'

export default defineConfig({
  plugins: [
    removeUseClient(),
    remixCloudflareDevProxy({ persist: { path: '../../cf-local-worker/v3' } }),
    remix({
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
        unstable_singleFetch: true,
      },
    }),
    tsconfigPaths(),
  ],
})

// https://remix.run/docs/en/main/guides/single-fetch#enable-single-fetch-types
declare module '@remix-run/cloudflare' {
  interface Future {
    unstable_singleFetch: true
  }
}

// Vite React "use client" sourcemap warning
// https://stackoverflow.com/a/78751258
function removeUseClient() {
  const filter = createFilter(/.*\.(js|ts|jsx|tsx)$/)

  return {
    name: 'remove-use-client',

    transform(code: string, id: string) {
      if (!filter(id)) {
        return null
      }

      const newCode = code.replace(/['"]use client['"];\s*/g, '')

      return { code: newCode, map: null }
    },
  }
}
