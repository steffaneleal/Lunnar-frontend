<template>
  <v-container>
    <h1 class="text-h4 mb-6">Meu perfil</h1>

    <v-row>
      <!-- Coluna de Dados da Conta -->
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

      <!-- Coluna de Endereços -->
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title class="text-subtitle-1 text-medium-emphasis d-flex align-center justify-space-between">
            <span>Meus Endereços</span>
            <v-btn size="small" color="primary" variant="tonal" @click="addressModal = true">
              Adicionar Novo
            </v-btn>
          </v-card-title>
          <v-card-text>
            <v-progress-circular v-if="loadingAddresses" indeterminate></v-progress-circular>
            <v-alert v-else-if="addresses.length === 0" type="info" variant="tonal" density="compact">
              Nenhum endereço cadastrado.
            </v-alert>
            <v-list v-else lines="two" class="pa-0">
              <v-list-item v-for="addr in addresses" :key="addr.id">
                <v-list-item-title>{{ addr.street }}, {{ addr.number }}</v-list-item-title>
                <v-list-item-subtitle>{{ addr.neighborhood }}, {{ addr.city }} - {{ addr.zip_code }}</v-list-item-subtitle>
                <template v-slot:append>
                  <v-btn
                    color="grey-lighten-1"
                    icon="mdi-delete"
                    variant="text"
                    @click="confirmDeleteAddress(addr.id)"
                  ></v-btn>
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Modal para Adicionar Endereço -->
    <v-dialog v-model="addressModal" max-width="600">
      <v-card>
        <v-card-title>Adicionar Novo Endereço</v-card-title>
        <v-card-text>
          <AddressForm @submit="handleNewAddress" />
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useApi } from '~/services/api'
import AddressForm from '~/components/AddressForm.vue'

const authStore = useAuthStore()
const api = useApi()

const addresses = ref<any[]>([])
const loadingAddresses = ref(false)
const addressModal = ref(false)

async function loadAddresses() {
  if (authStore.isAdmin) return
  loadingAddresses.value = true
  try {
    const { data } = await api.getMyAddresses()
    addresses.value = data
  } catch (err) {
    console.error("Erro ao buscar endereços:", err)
  } finally {
    loadingAddresses.value = false
  }
}

async function handleNewAddress(addressData: any) {
  try {
    const { data: newAddress } = await api.addMyAddress(addressData)
    addresses.value.push(newAddress)
    addressModal.value = false
  } catch (err) {
    console.error("Erro ao adicionar endereço:", err)
    alert('Não foi possível salvar o endereço. Tente novamente.')
  }
}

async function confirmDeleteAddress(id: string) {
  if (!confirm('Tem certeza que deseja excluir este endereço?')) return

  try {
    await api.deleteMyAddress(id)
    addresses.value = addresses.value.filter(addr => addr.id !== id)
  } catch (err) {
    console.error("Erro ao excluir endereço:", err)
    alert('Não foi possível excluir o endereço. Tente novamente.')
  }
}

onMounted(loadAddresses)
</script>
