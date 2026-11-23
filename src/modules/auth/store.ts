import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { authApi } from './api'
import type { AuthUser, LoginInput } from './types'
import { tokenStore } from '@/shared/auth/token-store'
import { can, type Permission } from '@/shared/auth/permission'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(null)
  const ready = ref(false)
  const isAuthenticated = computed(() => Boolean(user.value && tokenStore.get()))

  async function login(input: LoginInput) {
    const result = await authApi.login(input)
    tokenStore.set(result.accessToken)
    user.value = result.user
    ready.value = true
  }
  async function restoreSession() {
    if (ready.value) return
    ready.value = true
    if (import.meta.env.VITE_AUTH_MODE === 'mock') return
    try {
      const result = await authApi.refresh()
      tokenStore.set(result.accessToken)
      user.value = result.user
    } catch {
      clearSession()
    }
  }
  function clearSession() {
    tokenStore.clear()
    user.value = null
    ready.value = true
  }
  async function logout() {
    try { await authApi.logout() } finally { clearSession() }
  }
  function hasPermission(permission: Permission) {
    return Boolean(user.value && can(user.value.permissions, permission))
  }
  return { user, ready, isAuthenticated, login, restoreSession, clearSession, logout, hasPermission }
})
