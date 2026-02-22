<template>
  <v-container>
    <h1 class="text-h4 mb-6">Meu perfil</h1>

    <v-row>
      <!-- Coluna de Dados da Conta -->
      <v-col cols="12" md="6">
        <v-card class="mb-4">
          <v-card-title class="text-subtitle-1 text-medium-emphasis d-flex align-center justify-space-between">
            <span>Dados da conta</span>
            <v-btn size="small" color="primary" variant="tonal" @click="openAccountModal">
              Editar
            </v-btn>
          </v-card-title>
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

        <v-card v-if="!authStore.isAdmin">
          <v-card-title class="text-subtitle-1 text-medium-emphasis d-flex align-center justify-space-between">
            <span>Perfil do Cliente</span>
            <v-btn size="small" color="primary" variant="tonal" @click="openProfileModal">
              Editar
            </v-btn>
          </v-card-title>
          <v-card-text>
            <p v-if="profile?.companyName" class="mb-1"><strong>Empresa:</strong> {{ profile.companyName }}</p>
            <p v-if="profile?.phoneNumber" class="mb-1"><strong>Telefone:</strong> {{ formatPhone(profile.phoneNumber) }}</p>
            <v-alert v-if="loadingProfile" type="info" variant="tonal">Carregando perfil...</v-alert>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Coluna de Endereços -->
      <v-col cols="12" md="6" v-if="!authStore.isAdmin">
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
                    class="delete-button"
                    :color="hoveredDeleteId === addr.id ? 'red' : 'grey'"
                    :icon="hoveredDeleteId === addr.id ? 'mdi-delete' : 'mdi-delete'"
                    variant="text"
                    @click="confirmDeleteAddress(addr.id)"
                    @mouseover="hoveredDeleteId = addr.id"
                    @mouseleave="hoveredDeleteId = null"
                  ></v-btn>
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Modal para Editar Conta (nome e e-mail) -->
    <v-dialog v-model="accountModal" max-width="500">
      <v-card>
        <v-card-title>Editar Dados da Conta</v-card-title>
        <v-card-text>
          <v-text-field v-model="accountForm.name" label="Nome" variant="outlined" class="mb-2"></v-text-field>
          <v-text-field v-model="accountForm.email" label="E-mail" type="email" variant="outlined" class="mb-2"></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="accountModal = false">Cancelar</v-btn>
          <v-btn color="primary" :loading="savingAccount" @click="saveAccount">Salvar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Modal para Adicionar Endereço -->
    <v-dialog v-model="addressModal" max-width="600">
      <v-card>
        <v-card-title>Adicionar Novo Endereço</v-card-title>
        <v-card-text>
          <AddressForm @submit="handleNewAddress" />
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Modal para Editar Perfil -->
    <v-dialog v-model="profileModal" max-width="600">
      <v-card>
        <v-card-title>Editar Perfil</v-card-title>
        <v-card-text>
          <v-text-field v-model="profileForm.companyName" label="Nome da Empresa" variant="outlined" class="mb-2"></v-text-field>
          <v-text-field v-model="profileForm.phoneNumber" label="Telefone" variant="outlined" class="mb-2" maxlength="15"></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="profileModal = false">Cancelar</v-btn>
          <v-btn color="primary" @click="saveProfile">Salvar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </v-container>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useApi } from '~/services/api'
import AddressForm from '~/components/AddressForm.vue'

const authStore = useAuthStore()
const api = useApi()

const profile = ref<any>(null)
const loadingProfile = ref(false)
const profileModal = ref(false)
const profileForm = reactive({ companyName: '', phoneNumber: '' })

const accountModal = ref(false)
const savingAccount = ref(false)
const accountForm = reactive({ name: '', email: '' })

const addresses = ref<any[]>([])
const loadingAddresses = ref(false)
const addressModal = ref(false)
const hoveredDeleteId = ref<string | null>(null)

function openAccountModal() {
  accountForm.name = authStore.user?.name || ''
  accountForm.email = authStore.user?.email || ''
  accountModal.value = true
}

async function saveAccount() {
  savingAccount.value = true
  try {
    const { data } = await api.updateMe({
      name: accountForm.name.trim(),
      email: accountForm.email.trim(),
    })
    // Atualiza o store e o localStorage com os novos dados
    authStore.setAuth(authStore.token, { ...authStore.user, name: data.name, email: data.email })
    accountModal.value = false
  } catch (err: any) {
    const msg = err.response?.data || 'Não foi possível salvar. Tente novamente.'
    alert(msg)
  } finally {
    savingAccount.value = false
  }
}

function formatPhone(phone: string) {
  if (!phone) return ''
  const digits = phone.replace(/\D/g, '')
  if (digits.length <= 10) {
    return digits.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
  } else {
    return digits.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  }
}

watch(() => profileForm.phoneNumber, (newValue) => {
  profileForm.phoneNumber = formatPhone(newValue)
})

async function loadProfile() {
  if (authStore.isAdmin) return
  loadingProfile.value = true
  try {
    const { data } = await api.getMyProfile()
    profile.value = data
  } catch (err) {
    console.error("Erro ao buscar perfil:", err)
  } finally {
    loadingProfile.value = false
  }
}

function openProfileModal() {
  if (profile.value) {
    profileForm.companyName = profile.value.companyName || ''
    profileForm.phoneNumber = profile.value.phoneNumber || ''
  }
  profileModal.value = true
}

async function saveProfile() {
  try {
    const payload = {
      companyName: profileForm.companyName,
      phoneNumber: profileForm.phoneNumber.replace(/\D/g, ''),
    }
    const { data } = await api.updateMyProfile(payload)
    profile.value = data
    profileModal.value = false
  } catch (err) {
    console.error("Erro ao salvar perfil:", err)
    alert('Não foi possível salvar o perfil. Tente novamente.')
  }
}

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

onMounted(() => {
  loadProfile()
  loadAddresses()
})
</script>