import { storageBookmarkV1 } from '@/entrypoints/sotrage/bookmark.ts'

export default defineContentScript({
  // ref: https://developer.chrome.com/docs/extensions/develop/concepts/match-patterns
  matches: ['https://*/*', 'http://localhost/*'],
  async main() {
    // NOTE: Initialization (Mark bookmarked links)
    // await updateLinkIcon()
    // wait document rendering (like react hydration etc.) // if this run immediately, remix official cite sometime throw console error and content script not work
    setTimeout(updateLinkIcon, 1000)

    // NOTE: Message listener (Fire when bookmark list update)
    browser.runtime.onMessage.addListener(async () => {
      await updateLinkIcon()
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

const updateLinkIcon = async () => {
  const storeUrls = await storageBookmarkV1.getValue()
  const aTags = document.getElementsByTagName('a')
  for (let i = 0; i < aTags.length; i++) {
    // TODO: improve performance with check related domains only
    if (storeUrls.includes(aTags[i].href)) {
      if (aTags[i].textContent?.includes(' ✅')) continue

      // aTags[i].textContent += ' ✅' // NOTE: this syntax is some time break original dom structure
      // from // <a href="/kit-docs/overview"><div class="button selected"> <div class="icon layers" > <svg>...</svg> </div> <div class="text">Drizzle Kit</div> </div> </a>
      // to   // <a href="/kit-docs/overview">     Drizzle Kit   ✅</a> // inner div structure is removed!

      const span = document.createElement('span')
      span.textContent = ' ✅'
      span.style.fontSize = '0.76rem'
      span.style.paddingLeft = '3px'

      const lastElementChild = aTags[i].lastElementChild
      if (lastElementChild) {
        lastElementChild.appendChild(span)
      } else {
        // NOTE: append span element to keep original dom structure, but some time span treat as new line (as this code simply append the tag)
        aTags[i].appendChild(span)
      }
    }
  }
}
