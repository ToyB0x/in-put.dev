import { onAuthStateChanged } from 'firebase/auth/web-extension'
import { handleIconClick, handleLoadUrl, handleMessage, handleTabChange, registerIconMenu } from './handlers'
import { updateIcon } from './actions'
import { auth } from '@/entrypoints/libs/auth'

export default defineBackground(() => {
  handleTabChange(auth)
  handleIconClick(auth)
  handleLoadUrl(auth)
  handleMessage(auth)
  registerIconMenu(auth)

  // TODO: confirm should use unsubscribe on background unmount
  // Register Auth state change event
  onAuthStateChanged(auth, async (user) => {
    // initialize icon ui
    await updateIcon({ auth })

    // update icon menu
    await browser.action.setPopup({
      popup: user
        ? '' // blank string means no popup
        : 'popup-menu.html',
    })
  })
})
