import { tokenStore } from '@/shared/auth/token-store'

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/+$/, '')

export class ApiError extends Error {
  constructor(public status: number, message: string, public body?: unknown) {
    super(message)
    this.name = 'ApiError'
  }
}

function messageFromBody(body: unknown, fallback: string): string {
  if (typeof body !== 'object' || body === null || !('message' in body)) return fallback
  const message = body.message
  return typeof message === 'string' && message.trim() ? message : fallback
}

export async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const headers = new Headers(init.headers)
  headers.set('Accept', 'application/json')
  if (init.body && !(init.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  const accessToken = tokenStore.get()
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`)

  let response: Response
  try {
    response = await fetch(`${API_BASE}${normalizedPath}`, {
      ...init, headers, credentials: 'include',
    })
  } catch (error) {
    throw new ApiError(0, error instanceof Error ? error.message : 'Network request failed')
  }

  if (response.status === 204) return undefined as T
  const contentType = response.headers.get('content-type') || ''
  const body: unknown = contentType.includes('application/json')
    ? await response.json()
    : await response.text()
  if (!response.ok) {
    throw new ApiError(response.status, messageFromBody(body, response.statusText || 'Request failed'), body)
  }
  return body as T
}
