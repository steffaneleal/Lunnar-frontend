<template>
  <v-container class="fill-height justify-center align-center">
    <v-card width="100%" max-width="450" class="pa-4">
      <v-card-title class="text-h5 font-weight-bold text-center">Entrar</v-card-title>
      <v-card-subtitle class="text-center mb-1">Lunnar</v-card-subtitle>

      <v-card-text>
        <v-form @submit.prevent="submit">
          <v-text-field
            v-model="email"
            label="E-mail"
            type="email"
            placeholder="seu@email.com"
            variant="outlined"
            required
          ></v-text-field>

          <v-text-field
            v-model="password"
            label="Senha"
            type="password"
            placeholder="••••••••"
            variant="outlined"
            required
          ></v-text-field>

          <v-alert v-if="error" type="error" variant="tonal" class="mb-4" density="compact">
            {{ error }}
          </v-alert>

          <v-btn type="submit" block color="primary" size="large" :loading="loading">
            Entrar
          </v-btn>
        </v-form>
      </v-card-text>

      <v-card-actions class="justify-center">
        <span class="text-body-2 text-medium-emphasis">
          Não tem conta?
          <NuxtLink to="/register" class="text-primary text-decoration-none">Cadastre-se</NuxtLink>
        </span>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useApi } from '~/services/api'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const api = useApi()

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

async function submit() {
  error.value = ''
  loading.value = true
  try {
    const { data } = await api.login(email.value, password.value)
    authStore.setAuth(data.token, { name: data.name })
    await authStore.fetchUser()
    const redirect = route.query.redirect as string
    router.push(redirect || '/')
  } catch (err: any) {
    error.value =
      err.response?.status === 400
        ? 'E-mail ou senha inválidos.'
        : 'Erro ao entrar. Tente novamente.'
  } finally {
    loading.value = false
  }
}
</script>
