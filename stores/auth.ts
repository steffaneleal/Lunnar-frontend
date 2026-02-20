import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useApi } from '../services/api'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(null)
  const user = ref<Record<string, any> | null>(null)

  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role === 'ADMIN')

  // Inicializa a partir do localStorage (client-side apenas)
  function init() {
    if (import.meta.client) {
      token.value = localStorage.getItem('token')
      const stored = localStorage.getItem('user')
      user.value = stored ? JSON.parse(stored) : null
    }
  }

  function setAuth(newToken: string | null, newUser: Record<string, any> | null) {
    token.value = newToken
    user.value = newUser
    if (import.meta.client) {
      if (newToken) {
        localStorage.setItem('token', newToken)
        localStorage.setItem('user', JSON.stringify(newUser || {}))
      } else {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
  }

  async function fetchUser() {
    if (!token.value) return
    try {
      const api = useApi()
      const { data } = await api.getMe()
      user.value = { ...data, role: data.role }
      if (import.meta.client) {
        localStorage.setItem('user', JSON.stringify(user.value))
      }
      return user.value
    } catch {
      setAuth(null, null)
    }
  }

  function logout() {
    setAuth(null, null)
  }

  return {
    token,
    user,
    isAuthenticated,
    isAdmin,
    init,
    setAuth,
    fetchUser,
    logout,
  }
})
