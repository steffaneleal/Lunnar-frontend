<!-- MEU PERFIL -->
<template>
  <v-container>
    <h1 class="text-h4 mb-6">Meu perfil</h1>

    <v-row>
      <v-col cols="12" md="6">
        <v-card class="mb-4">
          <v-card-title class="text-subtitle-1 text-medium-emphasis">Dados da conta</v-card-title>
          <v-card-text>
            <p class="mb-1"><strong>Nome:</strong> {{ authStore.user?.name }}</p>
            <p class="mb-1"><strong>E-mail:</strong> {{ authStore.user?.email }}</p>
            <p class="mb-0">
              <strong>Perfil:</strong>
              <v-chip size="small" :color="authStore.isAdmin ? 'primary' : 'secondary'">
                {{ authStore.isAdmin ? 'Administrador' : 'Cliente' }}
              </v-chip>
            </p>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6" v-if="!authStore.isAdmin">
        <v-card v-if="profile">
          <v-card-title class="text-subtitle-1 text-medium-emphasis">
            Perfil de cliente (CRM)
          </v-card-title>
          <v-card-text>
            <p v-if="profile.companyName" class="mb-1">
              <strong>Empresa:</strong> {{ profile.companyName }}
            </p>
            <p v-if="profile.phoneNumber" class="mb-1">
              <strong>Telefone:</strong> {{ profile.phoneNumber }}
            </p>
            <p v-if="profile.notes" class="mb-1">
              <strong>Notas (admin):</strong> {{ profile.notes }}
            </p>
            <p v-if="profile.lastContactAt" class="mb-1">
              Último contato: {{ formatDate(profile.lastContactAt) }}
            </p>
            <p v-else class="text-caption text-disabled mt-2">
              Apenas o administrador pode editar notas e último contato.
            </p>
          </v-card-text>
        </v-card>

        <v-alert v-if="loadingProfile" type="info" variant="tonal" class="mt-4">
          Carregando perfil de cliente...
        </v-alert>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useApi } from '~/services/api'

const authStore = useAuthStore()
const api = useApi()
const profile = ref<any>(null)
const loadingProfile = ref(false)

function formatDate(d: string) {
  if (!d) return '—'
  return new Date(d).toLocaleString('pt-BR')
}

onMounted(async () => {
  if (authStore.isAdmin) return
  loadingProfile.value = true
  try {
    const { data } = await api.getMyProfile()
    profile.value = data
  } catch {
    profile.value = null
  } finally {
    loadingProfile.value = false
  }
})
</script>
