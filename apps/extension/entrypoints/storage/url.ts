type StorageBookmarkV1 = string[] // urls

export const storageURLv1 = storage.defineItem<StorageBookmarkV1>('local:bookmark', {
  fallback: [],
  version: 1,
})
