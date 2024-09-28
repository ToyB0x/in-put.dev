import { updateIcon } from './updateIcon'

export const updateIconAndContentWithStorageData = async () => {
  // update icon menu ui
  const [activeTab] = await browser.tabs.query({ active: true, currentWindow: true })
  const activeUrl = activeTab.url
  await updateIcon({ activeUrl })

  // update content script ui
  if (!activeTab.id) return
  await browser.tabs.sendMessage(activeTab.id, { type: 'store-updated' })
}
