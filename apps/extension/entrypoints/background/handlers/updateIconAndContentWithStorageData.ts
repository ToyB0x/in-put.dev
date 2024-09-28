import { auth } from '@/entrypoints/libs/auth'
import { updateIcon } from './updateIcon.ts'

export const updateIconAndContentWithStorageData = async () => {
  // update icon menu ui
  const [activeTab] = await browser.tabs.query({ active: true, currentWindow: true })
  const activeUrl = activeTab.url
  await updateIcon({
    auth,
    activeUrl,
  })

  // update content script ui
  if (!activeTab.id) return
  await browser.tabs.sendMessage(activeTab.id, { type: 'store-updated' })
}
