import { tokenStore } from '@/shared/auth/token-store'

export const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/+$/, '')
export const DEFAULT_TIMEOUT_MS = 15_000
export const AUTH_ENDPOINTS = new Set(['/auth/login', '/auth/refresh', '/auth/logout'])

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

export function normalizePath(path: string) {
  return path.startsWith('/') ? path : `/${path}`
}

export function bodyMessage(body: unknown, fallback: string): string {
  if (typeof body !== 'object' || body === null) return fallback
  for (const key of ['message', 'detail', 'error']) {
    const value = (body as Record<string, unknown>)[key]
    if (typeof value === 'string' && value.trim()) return value
  }
  return fallback
}

export async function parseBody(response: Response): Promise<unknown> {
  if (response.status === 204 || response.status === 205) return undefined
  const text = await response.text()
  if (!text) return undefined
  const contentType = response.headers.get('content-type') || ''
  if (!contentType.includes('application/json')) return text
  try {
    return JSON.parse(text) as unknown
  } catch {
    throw new ApiError(
      response.status,
      '服务器返回了无效 JSON',
      undefined,
      response.headers.get('x-request-id') || undefined,
    )
  }
}

/** Timeout covers both response headers and complete response body consumption. */
export async function fetchWithTimeout<T>(
  url: string,
  init: RequestInit,
  timeoutMs: number,
  consume: (response: Response) => Promise<T>,
): Promise<T> {
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
    const response = await fetch(url, { ...init, signal: controller.signal })
    return await consume(response)
  } catch (error) {
    if (error instanceof ApiError) throw error
    if (timedOut) throw new ApiError(408, `请求超时（${timeoutMs}ms）`)
    if (init.signal?.aborted) throw new ApiError(499, '请求已取消')
    throw new ApiError(0, error instanceof Error ? error.message : '网络连接失败')
  } finally {
    clearTimeout(timer)
    init.signal?.removeEventListener('abort', abortFromCaller)
  }
}

let refreshPromise: Promise<string | null> | null = null

export async function refreshAccessToken(timeoutMs: number): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = fetchWithTimeout(
      `${API_BASE}/auth/refresh`,
      {
        method: 'POST',
        credentials: 'include',
        headers: { Accept: 'application/json' },
      },
      timeoutMs,
      async (response) => {
        if (!response.ok) return null
        const body = await parseBody(response)
        if (typeof body !== 'object' || body === null) return null
        const token = (body as Record<string, unknown>).accessToken
        if (typeof token !== 'string' || !token) return null
        tokenStore.set(token)
        return token
      },
    ).catch(() => null).finally(() => {
      refreshPromise = null
    })
  }
  return refreshPromise
}

export function canReplay(method: string, headers: Headers): boolean {
  return ['GET', 'HEAD', 'OPTIONS'].includes(method) || headers.has('Idempotency-Key')
}

export function requestHeaders(init: RequestInit, accessToken: string | null): Headers {
  const headers = new Headers(init.headers)
  headers.set('Accept', 'application/json')
  const isFormData = typeof FormData !== 'undefined' && init.body instanceof FormData
  if (init.body !== undefined && init.body !== null && !isFormData && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`)
  else headers.delete('Authorization')
  return headers
}

export async function execute<T>(
  path: string,
  init: RequestInit,
  timeoutMs: number,
  accessToken: string | null,
): Promise<T> {
  const headers = requestHeaders(init, accessToken)
  return fetchWithTimeout(
    `${API_BASE}${path}`,
    { ...init, headers, credentials: 'include' },
    timeoutMs,
    async (response) => {
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
    },
  )
}

export async function executeBlob(
  path: string,
  init: RequestInit,
  timeoutMs: number,
  accessToken: string | null,
): Promise<Blob> {
  const headers = requestHeaders(init, accessToken)
  headers.set('Accept', 'application/octet-stream, */*')
  return fetchWithTimeout(
    `${API_BASE}${path}`,
    { ...init, headers, credentials: 'include' },
    timeoutMs,
    async (response) => {
      if (!response.ok) {
        const body = await parseBody(response)
        throw new ApiError(
          response.status,
          bodyMessage(body, response.statusText || '文件请求失败'),
          body,
          response.headers.get('x-request-id') || undefined,
        )
      }
      if (response.status === 204 || response.status === 205) return new Blob()
      return response.blob()
    },
  )
}

export async function tokenForRetry(
  previousToken: string | null,
  timeoutMs: number,
): Promise<string | null> {
  const latestToken = tokenStore.get()
  if (latestToken && latestToken !== previousToken) return latestToken
  return refreshAccessToken(timeoutMs)
}

export function notifySessionExpired() {
  tokenStore.clear()
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('robotops:session-expired'))
  }
}
