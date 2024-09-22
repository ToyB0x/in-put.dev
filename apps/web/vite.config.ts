import { createFilter, defineConfig, build, type PluginOption } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import { vitePlugin as remix, cloudflareDevProxyVitePlugin as remixCloudflareDevProxy } from '@remix-run/dev'

export default defineConfig({
  plugins: [
    removeUseClient(),
    serviceWorkerBuildPlugin(),
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
function removeUseClient(): PluginOption {
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

// NOTE: this plugin build service-worker.ts to public dir (currently don't watch file change)
function serviceWorkerBuildPlugin(): PluginOption {
  return {
    name: 'build-service-worker',
    enforce: 'pre',
    async buildStart() {
      console.info('Building service worker')
      await build({
        logLevel: 'error',
        configFile: false,
        appType: undefined,
        publicDir: false,
        build: {
          target: 'modules',
          copyPublicDir: false,
          write: true,
          outDir: 'public',
          emptyOutDir: false,
          minify: false,
          rollupOptions: {
            input: './service-worker/service-worker.ts',
            output: {
              format: 'esm',
              esModule: true,
              entryFileNames: 'service-worker.js',
            },
          },
        },
      })
    },
  }
}
