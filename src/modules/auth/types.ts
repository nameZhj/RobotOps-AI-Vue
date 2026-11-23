import type { Permission, Role } from '@/shared/auth/permission'

export interface AuthUser {
  id: string
  username: string
  displayName: string
  role: Role
  permissions: Permission[]
}

export interface LoginInput { username: string; password: string }
export interface LoginResult { accessToken: string; expiresIn: number; user: AuthUser }
