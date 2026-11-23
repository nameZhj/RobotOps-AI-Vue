import { tokenStore } from '@/shared/auth/token-store'

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/+$/, '')
const DEFAULT_TIMEOUT_MS = 15_000
const AUTH_ENDPOINTS = new Set(['/auth/login', '/auth/refresh', '/auth/logout'])

export interface RequestOptions extends RequestInit {
  timeoutMs?: number
  auth?: boolean
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly body?: unknown,
    public readonly requestId?: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

function normalizePath(path: string) {
  return path.startsWith('/') ? path : `/${path}`
}

function bodyMessage(body: unknown, fallback: string): string {
  if (typeof body !== 'object' || body === null) return fallback
  for (const key of ['message', 'detail', 'error']) {
    const value = (body as Record<string, unknown>)[key]
    if (typeof value === 'string' && value.trim()) return value
  }
  return fallback
}

async function parseBody(response: Response): Promise<unknown> {
  if (response.status === 204 || response.status === 205) return undefined
  const text = await response.text()
  if (!text) return undefined
  const contentType = response.headers.get('content-type') || ''
  if (!contentType.includes('application/json')) return text
  try { return JSON.parse(text) as unknown }
  catch { throw new ApiError(response.status, '服务器返回了无效 JSON', undefined, response.headers.get('x-request-id') || undefined) }
}

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController()
  let timedOut = false
  const abortFromCaller = () => controller.abort(init.signal?.reason)
  if (init.signal?.aborted) abortFromCaller()
  else init.signal?.addEventListener('abort', abortFromCaller, { once: true })
  const timer = setTimeout(() => {
    timedOut = true
    controller.abort(new Error('Request timeout'))
  }, timeoutMs)
  try {
    return await fetch(url, { ...init, signal: controller.signal })
  } catch (error) {
    if (timedOut) throw new ApiError(408, `请求超时（${timeoutMs}ms）`)
    if (init.signal?.aborted) throw new ApiError(499, '请求已取消')
    throw new ApiError(0, error instanceof Error ? error.message : '网络连接失败')
  } finally {
    clearTimeout(timer)
    init.signal?.removeEventListener('abort', abortFromCaller)
  }
}

let refreshPromise: Promise<string | null> | null = null

async function refreshAccessToken(timeoutMs: number): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const response = await fetchWithTimeout(`${API_BASE}/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
          headers: { Accept: 'application/json' },
        }, timeoutMs)
        if (!response.ok) return null
        const body = await parseBody(response)
        if (typeof body !== 'object' || body === null) return null
        const token = (body as Record<string, unknown>).accessToken
        if (typeof token !== 'string' || !token) return null
        tokenStore.set(token)
        return token
      } catch { return null }
      finally { refreshPromise = null }
    })()
  }
  return refreshPromise
}

function canReplay(method: string, headers: Headers): boolean {
  return ['GET', 'HEAD', 'OPTIONS'].includes(method) || headers.has('Idempotency-Key')
}

async function execute<T>(path: string, init: RequestInit, timeoutMs: number, accessToken: string | null): Promise<T> {
  const headers = new Headers(init.headers)
  headers.set('Accept', 'application/json')
  const hasFormData = typeof FormData !== 'undefined' && init.body instanceof FormData
  if (init.body !== undefined && init.body !== null && !hasFormData && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`)
  else headers.delete('Authorization')

  const response = await fetchWithTimeout(`${API_BASE}${path}`, {
    ...init, headers, credentials: 'include',
  }, timeoutMs)
  const body = await parseBody(response)
  if (!response.ok) {
    throw new ApiError(
      response.status,
      bodyMessage(body, response.statusText || '请求失败'),
      body,
      response.headers.get('x-request-id') || undefined,
    )
  }
  return body as T
}

/**
 * Shared HTTP entry point.
 * - memory-only Bearer access token + HttpOnly refresh cookie
 * - 401 single-flight refresh; unsafe writes require Idempotency-Key before replay
 * - per-request timeout and AbortSignal support
 * - no generic retries for non-idempotent operations
 */
export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const normalizedPath = normalizePath(path)
  const { timeoutMs = DEFAULT_TIMEOUT_MS, auth = true, ...init } = options
  const method = (init.method || 'GET').toUpperCase()
  const headers = new Headers(init.headers)
  const token = auth ? tokenStore.get() : null
  try {
    return await execute<T>(normalizedPath, init, timeoutMs, token)
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401 || !auth || AUTH_ENDPOINTS.has(normalizedPath)) throw error
    const refreshed = await refreshAccessToken(timeoutMs)
    if (!refreshed) {
      tokenStore.clear()
      if (typeof window !== 'undefined') window.dispatchEvent(new Event('robotops:session-expired'))
      throw error
    }
    if (!canReplay(method, headers)) throw new ApiError(401, '会话已刷新，请重新提交本次操作', error.body, error.requestId)
    return execute<T>(normalizedPath, init, timeoutMs, refreshed)
  }
}

export const http = {
  get: <T>(path: string, options?: RequestOptions) => request<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) => request<T>(path, {
    ...options, method: 'POST', body: body === undefined ? undefined : JSON.stringify(body),
  }),
  put: <T>(path: string, body: unknown, options?: RequestOptions) => request<T>(path, {
    ...options, method: 'PUT', body: JSON.stringify(body),
  }),
  patch: <T>(path: string, body: unknown, options?: RequestOptions) => request<T>(path, {
    ...options, method: 'PATCH', body: JSON.stringify(body),
  }),
  delete: <T>(path: string, options?: RequestOptions) => request<T>(path, { ...options, method: 'DELETE' }),
}
