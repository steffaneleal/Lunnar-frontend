import { useAuthStore } from '../stores/auth'
import { defineNuxtRouteMiddleware, navigateTo } from 'nuxt/app'

export default defineNuxtRouteMiddleware((to) => {
  // Não roda no servidor — localStorage não existe lá, causaria flash de tela
  if (import.meta.server) return

  const authStore = useAuthStore()
  authStore.init()

  const guestRoutes = ['/login', '/register']
  const isGuestRoute = guestRoutes.includes(to.path)

  if (!isGuestRoute && !authStore.isAuthenticated) {
    return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
  }

  if (isGuestRoute && authStore.isAuthenticated) {
    return navigateTo('/')
  }

  // Rota exclusiva para admin
  if (to.path === '/customers' && !authStore.isAdmin) {
    return navigateTo('/')
  }
})