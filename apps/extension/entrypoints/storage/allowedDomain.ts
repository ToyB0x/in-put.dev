type StorageAllowedDomainV1 = string[] // domains

export const storageAllowedDomainV1 = storage.defineItem<StorageAllowedDomainV1>('local:allowed-domain', {
  fallback: [],
  version: 1,
})
