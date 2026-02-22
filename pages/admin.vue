<template>
  <v-container>
    <h1 class="text-h4 mb-1">Administrador</h1>
    <p class="text-subtitle-1 text-medium-emphasis mb-6">Gerencie os acessos dos usuários do sistema</p>

    <v-progress-linear v-if="loading" indeterminate class="mb-4"></v-progress-linear>

    <v-alert v-else-if="users.length === 0" type="info" variant="tonal">
      Nenhum usuário encontrado.
    </v-alert>

    <v-list v-else lines="two" border rounded="lg" class="pa-0">
      <template v-for="(user, index) in users" :key="user.id">
        <v-list-item class="py-3 px-4">
          <template v-slot:prepend>
            <v-avatar :color="user.role === 'ADMIN' ? 'primary' : 'grey-lighten-1'" size="40">
              <v-icon :color="user.role === 'ADMIN' ? 'white' : 'grey-darken-1'">
                {{ user.role === 'ADMIN' ? 'mdi-shield-account' : 'mdi-account' }}
              </v-icon>
            </v-avatar>
          </template>

          <v-list-item-title class="font-weight-medium">{{ user.name }}</v-list-item-title>
          <v-list-item-subtitle>{{ user.email }}</v-list-item-subtitle>

          <template v-slot:append>
            <div class="d-flex align-center gap-2">
              <v-chip
                  :color="user.role === 'ADMIN' ? 'primary' : 'grey'"
                  size="small"
                  variant="tonal"
                  class="mr-1"
              >
                {{ user.role === 'ADMIN' ? 'Admin' : 'Usuário' }}
              </v-chip>

              <!-- Botão detalhes -->
              <v-tooltip text="Ver detalhes" location="top">
                <template v-slot:activator="{ props }">
                  <v-btn
                      v-bind="props"
                      icon="mdi-account-details"
                      variant="text"
                      size="small"
                      color="secondary"
                      @click="openDetails(user)"
                  ></v-btn>
                </template>
              </v-tooltip>

              <!-- Botão alterar role — oculto para o próprio admin -->
              <template v-if="user.id !== authStore.user?.id">
                <v-tooltip :text="user.role === 'ADMIN' ? 'Revogar acesso admin' : 'Tornar administrador'" location="top">
                  <template v-slot:activator="{ props }">
                    <v-btn
                        v-bind="props"
                        :icon="user.role === 'ADMIN' ? 'mdi-shield-remove' : 'mdi-shield-plus'"
                        :color="user.role === 'ADMIN' ? 'error' : 'primary'"
                        variant="text"
                        size="small"
                        :loading="loadingId === user.id"
                        @click="toggleRole(user)"
                    ></v-btn>
                  </template>
                </v-tooltip>
              </template>
              <v-chip v-else size="small" variant="text" color="grey">você</v-chip>
            </div>
          </template>
        </v-list-item>

        <v-divider v-if="index < users.length - 1"></v-divider>
      </template>
    </v-list>

    <!-- Modal de detalhes do usuário -->
    <v-dialog v-model="detailsModal" max-width="480">
      <v-card v-if="selectedUser" rounded="lg">
        <v-card-title class="d-flex align-center pa-5 pb-3">
          <v-avatar :color="selectedUser.role === 'ADMIN' ? 'primary' : 'grey-lighten-1'" size="44" class="mr-3">
            <v-icon :color="selectedUser.role === 'ADMIN' ? 'white' : 'grey-darken-1'" size="24">
              {{ selectedUser.role === 'ADMIN' ? 'mdi-shield-account' : 'mdi-account' }}
            </v-icon>
          </v-avatar>
          <div>
            <div class="text-h6 font-weight-bold">{{ selectedUser.name }}</div>
            <v-chip :color="selectedUser.role === 'ADMIN' ? 'primary' : 'grey'" size="x-small" variant="tonal" class="mt-1">
              {{ selectedUser.role === 'ADMIN' ? 'Administrador' : 'Usuário' }}
            </v-chip>
          </div>
        </v-card-title>

        <v-divider></v-divider>

        <v-card-text class="pa-5">
          <v-list density="compact" class="pa-0">
            <v-list-item class="px-0 py-2">
              <template v-slot:prepend>
                <v-icon color="grey" size="20" class="mr-3">mdi-email-outline</v-icon>
              </template>
              <v-list-item-title class="text-caption text-grey mb-1">E-mail</v-list-item-title>
              <v-list-item-subtitle class="text-body-2 text-high-emphasis">{{ selectedUser.email }}</v-list-item-subtitle>
            </v-list-item>

            <v-list-item class="px-0 py-2">
              <template v-slot:prepend>
                <v-icon color="grey" size="20" class="mr-3">mdi-phone-outline</v-icon>
              </template>
              <v-list-item-title class="text-caption text-grey mb-1">Telefone</v-list-item-title>
              <v-list-item-subtitle class="text-body-2 text-high-emphasis">
                {{ selectedUser.phoneNumber ? formatPhone(selectedUser.phoneNumber) : '—' }}
              </v-list-item-subtitle>
            </v-list-item>

            <v-list-item class="px-0 py-2">
              <template v-slot:prepend>
                <v-icon color="grey" size="20" class="mr-3">mdi-cake-variant-outline</v-icon>
              </template>
              <v-list-item-title class="text-caption text-grey mb-1">Data de nascimento</v-list-item-title>
              <v-list-item-subtitle class="text-body-2 text-high-emphasis">
                {{ selectedUser.birthdate ? formatDate(selectedUser.birthdate) : '—' }}
              </v-list-item-subtitle>
            </v-list-item>

            <v-list-item class="px-0 py-2">
              <template v-slot:prepend>
                <v-icon color="grey" size="20" class="mr-3">mdi-calendar-plus-outline</v-icon>
              </template>
              <v-list-item-title class="text-caption text-grey mb-1">Membro desde</v-list-item-title>
              <v-list-item-subtitle class="text-body-2 text-high-emphasis">
                {{ selectedUser.createdAt ? formatDateTime(selectedUser.createdAt) : '—' }}
              </v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-card-text>

        <v-card-actions class="pa-4 pt-0">
          <v-spacer></v-spacer>
          <v-btn variant="tonal" @click="detailsModal = false">Fechar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar de feedback -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000" location="bottom right">
      {{ snackbar.message }}
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useApi } from '~/services/api'

const authStore = useAuthStore()
const api = useApi()

const users = ref<any[]>([])
const loading = ref(true)
const loadingId = ref<string | null>(null)
const detailsModal = ref(false)
const selectedUser = ref<any>(null)
const snackbar = ref({ show: false, message: '', color: 'success' })

function showFeedback(message: string, color = 'success') {
  snackbar.value = { show: true, message, color }
}

function openDetails(user: any) {
  selectedUser.value = user
  detailsModal.value = true
}

function formatPhone(phone: string) {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 11) return `(${digits.slice(0,2)}) ${digits.slice(2,7)}-${digits.slice(7)}`
  if (digits.length === 10) return `(${digits.slice(0,2)}) ${digits.slice(2,6)}-${digits.slice(6)}`
  return phone
}

function formatDate(date: string) {
  return new Date(date + 'T00:00:00').toLocaleDateString('pt-BR')
}

function formatDateTime(dt: string) {
  return new Date(dt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
}

async function loadUsers() {
  loading.value = true
  try {
    const { data } = await api.getAllUsers()
    users.value = data
  } catch {
    showFeedback('Erro ao carregar usuários.', 'error')
  } finally {
    loading.value = false
  }
}

async function toggleRole(user: any) {
  const novoRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN'
  const acao = novoRole === 'ADMIN' ? 'promovido a administrador' : 'rebaixado para usuário'

  loadingId.value = user.id
  try {
    const { data } = await api.updateUserRole(user.id, novoRole)
    const idx = users.value.findIndex(u => u.id === user.id)
    if (idx !== -1) users.value[idx] = data
    // Atualiza o modal se estiver aberto para este usuário
    if (selectedUser.value?.id === user.id) selectedUser.value = data
    showFeedback(`${user.name} foi ${acao} com sucesso.`)
  } catch (err: any) {
    const msg = err?.response?.data || 'Erro ao alterar o role do usuário.'
    showFeedback(msg, 'error')
  } finally {
    loadingId.value = null
  }
}

onMounted(loadUsers)
</script>