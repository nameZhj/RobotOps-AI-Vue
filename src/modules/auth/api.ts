import { request } from '@/shared/api/http'
import { permissionsForRole } from '@/shared/auth/permission'
import type { AuthUser, LoginInput, LoginResult } from './types'

const MOCK = import.meta.env.VITE_AUTH_MODE === 'mock'

export const authApi = {
  async login(input: LoginInput): Promise<LoginResult> {
    if (MOCK) {
      if (!input.username.trim() || !input.password) throw new Error('请输入用户名和密码')
      const role = input.username === 'viewer' ? 'viewer' : input.username === 'operator' ? 'operator' : 'admin'
      const user: AuthUser = { id: 'mock-user', username: input.username, displayName: `演示用户 (${role})`, role, permissions: permissionsForRole(role) }
      return { accessToken: 'mock-only-not-a-real-token', expiresIn: 3600, user }
    }
    return request<LoginResult>('/auth/login', { method: 'POST', body: JSON.stringify(input) })
  },
  async refresh(): Promise<LoginResult> {
    if (MOCK) throw new Error('Mock session is restored from in-memory demo state only')
    return request<LoginResult>('/auth/refresh', { method: 'POST' })
  },
  async logout(): Promise<void> {
    if (!MOCK) await request<void>('/auth/logout', { method: 'POST' })
  },
}
