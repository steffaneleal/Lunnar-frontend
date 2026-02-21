<!-- PEDIDOS -->
<template>
  <v-container>
    <h1 class="text-h4 mb-4">{{ authStore.isAdmin ? 'Todos os Pedidos' : 'Meus Pedidos' }}</h1>

    <v-progress-linear v-if="loading" indeterminate></v-progress-linear>

    <v-alert v-else-if="orders.length === 0" type="info" variant="tonal">
      Nenhum pedido encontrado.
    </v-alert>

    <v-row v-else>
      <v-col v-for="order in orders" :key="order.id" cols="12" md="6">
        <v-card>
          <v-card-title class="d-flex justify-space-between align-center">
            <span>Pedido #{{ order.id.slice(0, 8) }}</span>
            <v-chip :color="getStatusColor(order.status)" size="small">
              {{ order.status }}
            </v-chip>
          </v-card-title>
          <v-card-subtitle>
            {{ formatDate(order.createdAt) }}
          </v-card-subtitle>

          <v-card-text>
            <div v-if="authStore.isAdmin" class="text-body-2 mb-2">
              <strong>Cliente:</strong> {{ order.userName }} ({{ order.userEmail }})
            </div>
            <div class="text-h6 font-weight-bold">
              Total: R$ {{ formatPrice(order.totalPrice) }}
            </div>

            <v-list dense>
              <v-list-subheader>Itens</v-list-subheader>
              <v-list-item v-for="(item, i) in order.items" :key="i">
                <v-list-item-title>{{ item.productName }}</v-list-item-title>
                <v-list-item-subtitle>
                  {{ item.quantity }} x R$ {{ formatPrice(item.price) }}
                </v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card-text>

          <v-card-actions v-if="authStore.isAdmin">
            <v-spacer></v-spacer>
            <v-select
              v-model="order.status"
              :items="['PENDENTE', 'PAGO', 'ENVIADO', 'CONCLUIDO', 'CANCELADO']"
              density="compact"
              variant="outlined"
              hide-details
              style="max-width: 180px;"
              @update:modelValue="updateStatus(order)"
            ></v-select>
          </v-card-actions>
        </v-card>
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

const orders = ref<any[]>([])
const loading = ref(true)

function formatPrice(v: any) {
  return v != null ? Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'
}

function formatDate(d: string) {
  if (!d) return '—'
  return new Date(d).toLocaleString('pt-BR')
}

function getStatusColor(status: string) {
  switch (status) {
    case 'PENDENTE': return 'orange'
    case 'PAGO': return 'blue'
    case 'ENVIADO': return 'cyan'
    case 'CONCLUIDO': return 'green'
    case 'CANCELADO': return 'red'
    default: return 'grey'
  }
}

async function loadOrders() {
  loading.value = true
  try {
    const { data } = await api.getOrders()
    orders.value = data
  } finally {
    loading.value = false
  }
}

async function updateStatus(order: any) {
  try {
    await api.updateOrderStatus(order.id, order.status)
  } catch {
    alert('Erro ao atualizar status.')
    loadOrders() // Recarrega para reverter a mudança visual em caso de erro
  }
}

onMounted(loadOrders)
</script>
