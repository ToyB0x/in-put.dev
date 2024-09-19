type StorageBookmarkV1 = string[] // urls

export const storageBookmarkV1 = storage.defineItem<StorageBookmarkV1>('local:bookmark', {
  fallback: [],
  version: 1,
})
