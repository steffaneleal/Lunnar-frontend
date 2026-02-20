<template>
  <v-container class="fill-height" fluid>
    <v-row class="justify-center">
      <v-col cols="12" sm="8" md="4">
        <v-card>
          <v-card-title class="text-center">
            <h1>Cadastro</h1>
          </v-card-title>
          <v-card-subtitle class="text-center">
            Crie sua conta no Lunnar CRM
          </v-card-subtitle>
          <v-card-text>
            <v-form @submit.prevent="submit">
              <v-text-field
                v-model="form.name"
                label="Nome"
                required
                placeholder="Seu nome"
              ></v-text-field>
              <v-text-field
                v-model="form.email"
                label="E-mail"
                type="email"
                required
                placeholder="seu@email.com"
              ></v-text-field>
              <v-text-field
                v-model="form.password"
                label="Senha"
                type="password"
                required
                minlength="6"
                placeholder="••••••••"
              ></v-text-field>
              <v-text-field
                v-model="form.phone_number"
                label="Telefone"
                placeholder="(11) 99999-9999"
              ></v-text-field>
              <v-text-field
                v-model="form.birthdate"
                label="Data de nascimento"
                type="date"
              ></v-text-field>
              <v-alert v-if="error" type="error" dense>{{ error }}</v-alert>
              <v-btn
                type="submit"
                color="primary"
                block
                :loading="loading"
                :disabled="loading"
              >
                {{ loading ? 'Cadastrando...' : 'Cadastrar' }}
              </v-btn>
            </v-form>
          </v-card-text>
          <v-card-actions class="justify-center">
            <p>
              Já tem conta? <NuxtLink to="/login">Entrar</NuxtLink>
            </p>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useApi } from '~/services/api'

const router = useRouter()
const authStore = useAuthStore()
const api = useApi()

const form = reactive({
  name: '',
  email: '',
  password: '',
  phone_number: '',
  birthdate: '',
})
const loading = ref(false)
const error = ref('')

async function submit() {
  error.value = ''
  loading.value = true
  try {
    const { data } = await api.register({ ...form, provider: 'LOCAL' })
    authStore.setAuth(data.token, { name: data.name })
    await authStore.fetchUser()
    router.push('/')
  } catch (err: any) {
    error.value =
      err.response?.status === 400
        ? 'E-mail já cadastrado ou dados inválidos.'
        : 'Erro ao cadastrar. Tente novamente.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* This style block is intentionally left empty to resolve a build issue. */
</style>
