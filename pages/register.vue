<!-- CADASTRO -->
<template>
  <v-container class="fill-height justify-center align-center">
    <v-card width="100%" max-width="550" class="pa-4">
      <v-card-title class="text-h5 font-weight-bold text-center">Cadastro</v-card-title>
      <v-card-subtitle class="text-center mb-0">Crie sua conta no Lunnar</v-card-subtitle>

      <v-card-text>
        <v-form v-model="isFormValid" @submit.prevent="submit">

          <!-- Nome -->
          <v-text-field
            v-model="form.name"
            label="Nome"
            placeholder="Seu nome completo"
            variant="outlined"
            :rules="[rules.required]"
          ></v-text-field>

          <!-- Nome da Empresa -->
          <v-text-field
            v-model="form.companyName"
            label="Nome da Empresa (opcional)"
            placeholder="Sua empresa"
            variant="outlined"
          ></v-text-field>

          <!-- Email -->
          <v-text-field
            v-model="form.email"
            label="E-mail"
            type="email"
            placeholder="seu@email.com"
            variant="outlined"
            :rules="[rules.required, rules.email]"
          ></v-text-field>

          <!-- Senha -->
          <v-text-field
            v-model="form.password"
            label="Senha"
            type="password"
            placeholder="••••••••"
            variant="outlined"
            :rules="[rules.required, rules.minLength(6)]"
          ></v-text-field>

          <!-- Confirmar senha -->
          <v-text-field
            v-model="form.password_confirmation"
            label="Confirmar Senha"
            type="password"
            placeholder="••••••••"
            variant="outlined"
            :rules="[rules.required, rules.passwordMatch(form.password)]"
          ></v-text-field>

          <!-- Telefone -->
          <v-text-field
            v-model="form.phone_number"
            label="Telefone"
            placeholder="(11) 99999-9999"
            variant="outlined"
            maxlength="15"
            :rules="[rules.required]"
          ></v-text-field>

          <!-- Data de Nascimento -->
          <v-text-field
            v-model="form.birthdate"
            label="Data de nascimento"
            type="date"
            variant="outlined"
            :rules="[rules.required]"
          ></v-text-field>

          <v-alert v-if="error" type="error" variant="tonal" class="mb-4" density="compact">
            {{ error }}
          </v-alert>

          <!-- Botão -->
          <v-btn type="submit" block color="primary" size="large" :loading="loading" :disabled="!isFormValid">
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

// Validações do formulário
const isFormValid = ref(false)
const form = reactive({
  name: '',
  companyName: '',
  email: '',
  password: '',
  password_confirmation: '',
  phone_number: '',
  birthdate: '',
})
const loading = ref(false)
const error = ref('')

// Validação do campo de senha
const rules = {
  required: (v: string) => !!v || 'Este campo é obrigatório.',
  email: (v: string) => /.+@.+\..+/.test(v) || 'E-mail precisa ser válido.',
  minLength: (len: number) => (v: string) => (v && v.length >= len) || `A senha deve ter no mínimo ${len} caracteres.`,
  passwordMatch: (original: string) => (v: string) => v === original || 'As senhas não conferem.',
}

// Validação do campo de telefone
watch(() => form.phone_number, (newValue) => {
  const digits = newValue.replace(/\D/g, '')
  let formatted = ''
  if (digits.length > 0) {
    formatted = '(' + digits.substring(0, 2)
  }
  if (digits.length > 2) {
    formatted += ') ' + digits.substring(2, 7)
  }
  if (digits.length > 7) {
    formatted += '-' + digits.substring(7, 11)
  }
  form.phone_number = formatted
})

// Validação do campo de data de aniversário
watch(() => form.birthdate, (newValue) => {
  const parts = newValue.split('-')
  if (parts[0] && parts[0].length > 4) {
    parts[0] = parts[0].slice(0, 4)
    form.birthdate = parts.join('-')
  }
})

async function submit() {
  if (!isFormValid.value) return

  error.value = ''
  loading.value = true
  try {
    const { data } = await api.register({
      name: form.name,
      companyName: form.companyName,
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
