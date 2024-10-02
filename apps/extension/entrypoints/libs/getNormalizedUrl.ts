export const getNormalizedUrl = (url: string) => {
  const u = new URL(url)
  u.hash = ''
  u.search = ''
  if (u.pathname.endsWith('/')) {
    u.pathname = u.pathname.slice(0, -1)
  }
  return u.toString()
}
