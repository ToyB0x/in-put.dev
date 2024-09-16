import { storageBookmarkV1 } from '@/entrypoints/sotrage/bookmark.ts'

export default defineContentScript({
  // ref: https://developer.chrome.com/docs/extensions/develop/concepts/match-patterns
  matches: ['https://*/*', 'http://localhost/*'],
  async main() {
    // NOTE: Initialization (Mark bookmarked links)
    const storeUrls = await storageBookmarkV1.getValue()
    const aTags = document.getElementsByTagName('a')
    for (let i = 0; i < aTags.length; i++) {
      // TODO: improve performance with check related domains only
      if (storeUrls.includes(aTags[i].href)) {
        const span = document.createElement('span')
        span.textContent = ' ✅'
        span.style.fontSize = '0.76rem'
        aTags[i].appendChild(span)
      }
    }

    // NOTE: Message listener (Fire when bookmark list update)
    browser.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
      const storeUrls = await storageBookmarkV1.getValue()
      const aTags = document.getElementsByTagName('a')
      for (let i = 0; i < aTags.length; i++) {
        if (storeUrls.includes(aTags[i].href)) {
          if (aTags[i].textContent?.includes(' ✅')) {
            continue
          }

          const span = document.createElement('span')
          span.textContent = ' ✅'
          span.style.fontSize = '0.76rem'
          aTags[i].appendChild(span)
        }
      }
    })

    // NOTE: watcher don't work in content script
    // storageBookmarkV1.watch((newValue) => {
    //   const aTags = document.getElementsByTagName('a')
    //   for (let i = 0; i < aTags.length; i++) {
    //     if (newValue.includes(aTags[i].href)) {
    //       aTags[i].style.color = 'red!important'
    //     }
    //   }
    //   console.log('newValue', newValue)
    // })
  },
})
