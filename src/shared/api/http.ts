import {
  AUTH_ENDPOINTS,
  ApiError,
  DEFAULT_TIMEOUT_MS,
  canReplay,
  execute,
  normalizePath,
  notifySessionExpired,
  tokenForRetry,
  type RequestOptions,
} from './http-core'

export { ApiError, type RequestOptions } from './http-core'

/**
 * Shared JSON HTTP entry point.
 * Access token is memory-only; refresh token is an HttpOnly cookie.
 * Unsafe writes require Idempotency-Key before retry after a 401.
 */
export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const normalizedPath = normalizePath(path)
  const endpointPath = normalizedPath.split('?', 1)[0]
  const { timeoutMs = DEFAULT_TIMEOUT_MS, auth = true, ...init } = options
  const method = (init.method || 'GET').toUpperCase()
  const headers = new Headers(init.headers)
  const token = auth ? (await import('@/shared/auth/token-store')).tokenStore.get() : null

  try {
    return await execute<T>(normalizedPath, init, timeoutMs, token)
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401 || !auth || AUTH_ENDPOINTS.has(endpointPath)) {
      throw error
    }
    const refreshed = await tokenForRetry(token, timeoutMs)
    if (!refreshed) {
      notifySessionExpired()
      throw error
    }
    if (!canReplay(method, headers)) {
      throw new ApiError(401, '会话已刷新，请重新提交本次操作', error.body, error.requestId)
    }
    return execute<T>(normalizedPath, init, timeoutMs, refreshed)
  }
}

export const http = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, {
      ...options,
      method: 'POST',
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
  put: <T>(path: string, body: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'PUT', body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'DELETE' }),
}
