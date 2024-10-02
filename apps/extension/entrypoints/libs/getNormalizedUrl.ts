export const getNormalizedUrl = (url: string) => {
  const u = new URL(url)
  u.hash = ''
  u.search = ''
  return u.toString()
}
