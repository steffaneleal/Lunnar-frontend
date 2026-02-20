<template>
  <v-app-bar color="#1a1a22" theme="dark" flat border="b">
    <v-container class="d-flex align-center py-0">
      <NuxtLink to="/" class="d-flex align-center text-decoration-none text-h6 font-weight-bold text-primary mr-8">
        <v-img
          src="../public/lunnar-icon-light.png"
          alt="Lunnar Logo"
          width="32"
          height="32"
          class="mr-2"
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
