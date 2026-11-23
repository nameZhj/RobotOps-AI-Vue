let accessToken: string | null = null

/** Access tokens intentionally live only in memory. Never persist credentials in browser storage. */
export const tokenStore = {
  get: () => accessToken,
  set: (token: string | null) => { accessToken = token },
  clear: () => { accessToken = null },
}
