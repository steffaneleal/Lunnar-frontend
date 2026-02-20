<template>
  <v-app-bar color="#1c64c4" theme="light" flat border="b">
    <v-container class="d-flex align-center py-0">
      <NuxtLink to="/" class="d-flex align-center text-decoration-none text-h6 font-weight-regular text-primary mr-8 text-white">
        <v-img
          src="/lunnar-icon.png"
          alt="Lunnar Logo"
          width="32"
          height="32"
          class="mr-0.2"
        ></v-img>
        <span>Lunnar</span>
      </NuxtLink>
      <v-spacer></v-spacer>
      <v-btn to="/login" :variant="isLoginPage ? 'tonal' : 'text'" :disabled="isLoginPage">
        Login
      </v-btn>
      <v-btn to="/register" :variant="isRegisterPage ? 'tonal' : 'text'" :disabled="isRegisterPage">
        Cadastre-se
      </v-btn>
    </v-container>
  </v-app-bar>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const isLoginPage = computed(() => route.path === '/login')
const isRegisterPage = computed(() => route.path === '/register')
</script>
