import { defineConfig } from 'wxt'

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  runner: {
    chromiumArgs: ['--user-data-dir=./chrome-data'],
  },
  manifest: {
    action: {
      default_icon: 'icon/icon32.png',
      default_title: 'add bookmark',
      default_popup: undefined,
    },
    permissions: ['contextMenus'],
    // TODO: confirm valid content_security_policy
    // ref: https://firebase.google.com/docs/auth/web/chrome-extension?hl=ja#federated-sign-in
    // content_security_policy: `
    //   https://apis.google.com
    //   https://www.gstatic.com
    //   https://www.googleapis.com
    //   https://securetoken.googleapis.com`,
  },
})

// Chrome 拡張機能のマニフェスト ファイルで、https://apis.google.com URL を content_security_policy 許可リストに必ず追加してください。
