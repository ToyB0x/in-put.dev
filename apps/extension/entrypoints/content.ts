import { storageBookmarkV1 } from '@/entrypoints/sotrage/bookmark.ts'

const READX_BOOKMARK_ICON_CLASS = 'readx-bookmark-icon-class'
const DATA_SET_NAME = 'readx'

export default defineContentScript({
  // ref: https://developer.chrome.com/docs/extensions/develop/concepts/match-patterns
  matches: ['https://*/*', 'http://localhost/*'],
  async main() {
    // NOTE: Initialization (Mark bookmarked links)
    // await updateLinkIcon()
    // wait document rendering (like react hydration etc.) // if this run immediately, remix official cite sometime throw console error and content script not work
    setTimeout(addIconToLink, 1000)

    // Message listener (Fire when bookmark list updated)
    browser.runtime.onMessage.addListener(async () => {
      await addIconToLink()
      await removeIconFromLink()
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

const addIconToLink = async () => {
  const storeUrls = await storageBookmarkV1.getValue()
  const aTags = document.getElementsByTagName('a')
  for (const aTag of aTags) {
    // TODO: improve performance with check related domains only
    if (storeUrls.includes(aTag.href)) {
      if (aTag.textContent?.includes(' ✅')) continue

      // aTags[i].textContent += ' ✅' // NOTE: this syntax is some time break original dom structure
      // from // <a href="/kit-docs/overview"><div class="button selected"> <div class="icon layers" > <svg>...</svg> </div> <div class="text">Drizzle Kit</div> </div> </a>
      // to   // <a href="/kit-docs/overview">     Drizzle Kit   ✅</a> // inner div structure is removed!

      const span = document.createElement('span')
      span.id = window.crypto.randomUUID()
      span.className = READX_BOOKMARK_ICON_CLASS
      span.dataset[DATA_SET_NAME] = aTag.href
      span.textContent = ' ✅'
      span.style.fontSize = '0.76rem'
      span.style.paddingLeft = '3px'

      const lastElementChild = aTag.lastElementChild
      if (lastElementChild) {
        lastElementChild.appendChild(span)
      } else {
        // NOTE: append span element to keep original dom structure, but some time span treat as new line (as this code simply append the tag)
        aTag.appendChild(span)
      }
    }
  }
}

const removeIconFromLink = async () => {
  const storeUrls = await storageBookmarkV1.getValue()
  const iconsWithExtensionClass = document.getElementsByClassName(READX_BOOKMARK_ICON_CLASS)

  // NOTE: this code is not work, because have side effect to html document in loop (remove element affect to document)
  // for (const iconWithExtensionClass of iconsWithExtensionClass) {
  //   const dataSetUrl = iconWithExtensionClass.getAttribute('data-' + DATA_SET_NAME)
  //   if (!dataSetUrl) continue
  //
  //   if (!storeUrls.includes(dataSetUrl)) {
  //     iconWithExtensionClass.remove()
  //   } else {
  //     console.log('keep', dataSetUrl)
  //   }
  // }

  const shouldRemoveIds = []
  for (const iconWithExtensionClass of iconsWithExtensionClass) {
    const dataSetUrl = iconWithExtensionClass.getAttribute('data-' + DATA_SET_NAME)
    if (!dataSetUrl) continue

    if (!storeUrls.includes(dataSetUrl)) {
      shouldRemoveIds.push(iconWithExtensionClass.id)
    }
  }
  shouldRemoveIds.forEach((id) => document.getElementById(id)?.remove())
}
