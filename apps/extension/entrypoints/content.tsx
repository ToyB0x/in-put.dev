import { storageBookmarkV1 } from '@/entrypoints/storage/bookmark'
import { getPureUrl } from '@/entrypoints/libs/getPureUrl.ts'
import ReactDOM from 'react-dom/client'
// import App from './App.tsx'

const READX_BOOKMARK_ICON_CLASS = 'readx-bookmark-icon-class'
const DATA_SET_NAME = 'readx'

export default defineContentScript({
  // ref: https://developer.chrome.com/docs/extensions/develop/concepts/match-patterns
  matches: ['https://*/*', 'http://localhost/*'],
  cssInjectionMode: 'ui',
  async main(ctx) {
    // 3. Define your UI
    const ui = createIntegratedUi(ctx, {
      // name: 'example-ui',
      position: 'inline',
      onMount: (container) => {
        // alert(1)
        // Container is a body, and React warns when creating a root on the body, so create a wrapper div
        const app = document.createElement('div')
        // container.append(app)
        container.appendChild(app)

        // Create a root on the UI container and render a component
        const root = ReactDOM.createRoot(app)
        root.render(<App />)
        return root
      },
      onRemove: (root) => {
        // Unmount the root when the UI is removed
        root?.unmount()
      },
    })

    // 4. Mount the UI
    ui.mount()

    // NOTE: Initialization (Mark bookmarked links)
    // await updateLinkIcon()
    // wait document rendering (like react hydration etc.) // if this run immediately, remix official cite sometime throw console error and content script not work
    // setTimeout(addIconToLink, 100)

    // alert(1)
    // showDialog()

    // Message listener (Fire when bookmark list updated)
    // browser.runtime.onMessage.addListener(async () => {
    //   await addIconToLink()
    //   await removeIconFromLink()
    // })

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
    // like a menu for accessibility (user can access keyboard tab to navigate): eg "href='#'" or "href='/path#'"
    const isATagHasHash = aTag.href.includes('#')
    if (isATagHasHash) continue

    // a tag is full url or just only path from root
    const isATagFullUrl = aTag.href.startsWith('http://') || aTag.href.startsWith('https://')
    const browserLinkUrl = isATagFullUrl ? aTag.href : window.location.origin + aTag.href
    let pureBrowserLinkUrl = ''
    try {
      pureBrowserLinkUrl = getPureUrl(browserLinkUrl)
    } catch (e) {
      // like phone number containing https://nvd.nist.govtel:301-975-2000
      console.info(e)
    }

    if (storeUrls.includes(pureBrowserLinkUrl)) {
      if (aTag.textContent?.endsWith(' ✅')) continue

      // aTags[i].textContent += ' ✅' // NOTE: this syntax is some time break original dom structure
      // from // <a href="/kit-docs/overview"><div class="button selected"> <div class="icon layers" > <svg>...</svg> </div> <div class="text">Drizzle Kit</div> </div> </a>
      // to   // <a href="/kit-docs/overview">     Drizzle Kit   ✅</a> // inner div structure is removed!

      const span = document.createElement('span')
      span.id = window.crypto.randomUUID()
      span.className = READX_BOOKMARK_ICON_CLASS
      span.dataset[DATA_SET_NAME] = browserLinkUrl
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

// const showDialog = () => {
//   const dialog = document.createElement('div')
//   dialog.id = 'dialog-x'
//   dialog.style.height = '100px'
//   dialog.style.width = '200px'
//   dialog.style.backgroundColor = 'red'
//   dialog.style.position = 'absolute'
//   dialog.style.top = '8px'
//   dialog.style.right = '8px'
//   dialog.style.borderRadius = '8px'
//   dialog.style.zIndex = '999'
//   document.body.appendChild(dialog)
// }

const App = () => {
  return (
    <div
      id='react-app'
      className='absolute bg-amber-500 w-[480px] h-[480px] top-0 left-0 z-50'
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: '200px',
        height: '100px',
        background: 'black',
        zIndex: 9999,
      }}
    >
      hello
    </div>
  )
}
