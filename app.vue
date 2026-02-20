<template>
  <v-app>
    <component :is="currentNavbar" />
    <v-main>
      <v-container>
        <NuxtPage />
      </v-container>
    </v-main>
    <Footer />
  </v-app>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '~/stores/auth'
import AppNavbar from '~/components/AppNavbar.vue'
import AuthNavbar from '~/components/AuthNavbar.vue'
import Footer from '~/components/Footer.vue'

const route = useRoute()
const authStore = useAuthStore()

const currentNavbar = computed(() => {
  if (route.path === '/login' || route.path === '/register') {
    return AuthNavbar
  }
  return AppNavbar
})

// Inicializa dados de autenticação ao montar a app (client-side)
onMounted(() => {
  authStore.init()
})
</script>
