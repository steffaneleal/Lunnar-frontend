import { useAuthStore } from '../stores/auth'
import {defineNuxtRouteMiddleware, navigateTo} from "nuxt/app";

export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore()

  // Inicializa o store com dados do localStorage (cliente)
  if (import.meta.client) {
    authStore.init()
  }

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
