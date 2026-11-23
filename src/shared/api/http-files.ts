import { tokenStore } from '@/shared/auth/token-store'
import {
  AUTH_ENDPOINTS,
  ApiError,
  DEFAULT_TIMEOUT_MS,
  canReplay,
  executeBlob,
  normalizePath,
  notifySessionExpired,
  tokenForRetry,
  type RequestOptions,
} from './http-core'
import { request } from './http'

/** Upload a FormData body; the browser sets the multipart boundary automatically. */
export function uploadFile<T>(
  path: string,
  form: FormData,
  options: RequestOptions = {},
): Promise<T> {
  return request<T>(path, { ...options, method: options.method || 'POST', body: form })
}

/** Download a binary response as Blob with the same auth refresh and cancellation rules. */
export async function downloadFile(
  path: string,
  options: RequestOptions = {},
): Promise<Blob> {
  const normalizedPath = normalizePath(path)
  const endpointPath = normalizedPath.split('?', 1)[0]
  const { timeoutMs = DEFAULT_TIMEOUT_MS, auth = true, ...init } = options
  const method = (init.method || 'GET').toUpperCase()
  const headers = new Headers(init.headers)
  const token = auth ? tokenStore.get() : null

  try {
    return await executeBlob(normalizedPath, init, timeoutMs, token)
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
      throw new ApiError(401, '会话已刷新，请重新提交本次文件操作', error.body, error.requestId)
    }
    return executeBlob(normalizedPath, init, timeoutMs, refreshed)
  }
}
