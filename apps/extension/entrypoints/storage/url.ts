type StorageURLv1 = {
  url: string
  isMarked: boolean
}[]

export const storageURLv1 = storage.defineItem<StorageURLv1>('local:url', {
  fallback: [],
  version: 1,
})
