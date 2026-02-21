<!-- CADASTRO -->
<template>
  <v-container class="fill-height justify-center align-center">
    <v-card width="100%" max-width="550" class="pa-4">
      <v-card-title class="text-h5 font-weight-bold text-center">Cadastro</v-card-title>
      <v-card-subtitle class="text-center mb-0">Crie sua conta no Lunnar</v-card-subtitle>

      <v-card-text>
        <v-form @submit.prevent="submit">

          <!-- Nome -->
          <v-text-field
            v-model="form.name"
            label="Nome"
            placeholder="Seu nome completo"
            variant="outlined"
            required
          ></v-text-field>

          <!-- Email -->
          <v-text-field
            v-model="form.email"
            label="E-mail"
            type="email"
            placeholder="seu@email.com"
            variant="outlined"
            required
          ></v-text-field>

          <!-- Senha -->
          <v-text-field
            v-model="form.password"
            label="Senha"
            type="password"
            placeholder="••••••••"
            variant="outlined"
            required
            minlength="6"
          ></v-text-field>

          <!-- Confirmar senha -->
          <v-text-field
            v-model="form.password_confirmation"
            label="Confirmar Senha"
            type="password"
            placeholder="••••••••"
            variant="outlined"
            required
          ></v-text-field>

          <!-- Telefone -->
          <v-text-field
            v-model="form.phone_number"
            label="Telefone"
            placeholder="(11) 99999-9999"
            variant="outlined"
            maxlength="15"
          ></v-text-field>

          <!-- Data de Nascimento -->
          <v-text-field
            v-model="form.birthdate"
            label="Data de nascimento"
            type="date"
            variant="outlined"
          ></v-text-field>

          <v-alert v-if="error" type="error" variant="tonal" class="mb-4" density="compact">
            {{ error }}
          </v-alert>

          <!-- Botão -->
          <v-btn type="submit" block color="primary" size="large" :loading="loading">
            Cadastrar
          </v-btn>
        </v-form>
      </v-card-text>

      <!-- Login -->
      <v-card-actions class="justify-center">
        <span class="text-body-2 text-medium-emphasis">
          Já tem conta?
          <NuxtLink to="/login" class="text-primary text-decoration-none">Entrar</NuxtLink>
        </span>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useApi } from '~/services/api'

const router = useRouter()
const authStore = useAuthStore()
const api = useApi()

const form = reactive({
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
  phone_number: '',
  birthdate: '',
})
const loading = ref(false)
const error = ref('')

watch(() => form.phone_number, (newValue) => {
  let x = newValue.replace(/\D/g, '').match(/(\d{0,2})(\d{0,5})(\d{0,4})/)
  if (!x) return
  form.phone_number = !x[2] ? x[1] : '(' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : '')
})

async function submit() {
  error.value = ''
  if (form.password !== form.password_confirmation) {
    error.value = 'As senhas não conferem.'
    return
  }

  loading.value = true
  try {
    const { data } = await api.register({
      name: form.name,
      email: form.email,
      password: form.password,
      phone_number: form.phone_number.replace(/\D/g, ''), // Envia apenas os números
      birthdate: form.birthdate,
      provider: 'LOCAL'
    })
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
