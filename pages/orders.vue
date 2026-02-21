<template>
  <v-container>
    <h1 class="text-h4 mb-4">{{ authStore.isAdmin ? 'Todos os Pedidos' : 'Meus Pedidos' }}</h1>

    <v-progress-linear v-if="loading" indeterminate></v-progress-linear>

    <v-alert v-else-if="orders.length === 0" type="info" variant="tonal">
      Nenhum pedido encontrado.
    </v-alert>

    <v-row v-else>
      <!-- Card Resumido do Pedido -->
      <v-col class="pa-3" v-for="order in orders" :key="order.id" cols="12" sm="6" md="4">
        <v-card>
          <v-card-title class="d-flex justify-space-between align-center">
            <span>Pedido #{{ order.id.slice(0, 8) }}</span>
            <v-chip :color="getStatusColor(order.status)" size="small" variant="tonal">
              {{ order.status }}
            </v-chip>
          </v-card-title>
          <v-card-subtitle>{{ formatDate(order.createdAt) }}</v-card-subtitle>

          <v-card-actions class="align-center">
            <span class="text-h6 font-weight-bold ml-2">R$ {{ formatPrice(order.totalPrice) }}</span>
            <v-spacer></v-spacer>
            <v-btn color="primary" variant="text" @click="openDetailsModal(order)">
              Ver Detalhes
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- Modal de Detalhes do Pedido -->
    <v-dialog v-model="detailsModal" max-width="700">
      <v-card v-if="selectedOrder">
        <v-card-title class="d-flex justify-space-between align-center">
          <span>Detalhes do Pedido #{{ selectedOrder.id.slice(0, 8) }}</span>
          <v-chip :color="getStatusColor(selectedOrder.status)" size="small">
            {{ selectedOrder.status }}
          </v-chip>
        </v-card-title>
        <v-card-subtitle>{{ formatDate(selectedOrder.createdAt) }}</v-card-subtitle>

        <v-card-text>
          <div v-if="authStore.isAdmin" class="text-body-1 mb-4">
            <strong>Cliente:</strong> {{ selectedOrder.userName }}
            <span v-if="selectedOrder.userCompanyName" class="text-grey ml-2">({{ selectedOrder.userCompanyName }})</span>
          </div>

          <v-list dense class="py-0">
            <v-list-subheader>Itens</v-list-subheader>
            <v-list-item v-for="(item, i) in selectedOrder.items" :key="i">
              <v-list-item-title>{{ item.product_name }}</v-list-item-title>
              <v-list-item-subtitle>
                {{ item.quantity }} x R$ {{ formatPrice(item.unit_price) }}
              </v-list-item-subtitle>
            </v-list-item>
          </v-list>

          <v-divider class="my-3"></v-divider>

          <div class="text-h6 font-weight-bold text-right">
            Total: R$ {{ formatPrice(selectedOrder.totalPrice) }}
          </div>
        </v-card-text>

        <v-card-actions class="pa-4">
          <template v-if="authStore.isAdmin">
            <span class="text-subtitle-1">Alterar Status:</span>
            <v-select
              v-model="selectedOrder.status"
              :items="['PENDENTE', 'PAGO', 'ENVIADO', 'CONCLUIDO', 'CANCELADO']"
              density="compact"
              variant="outlined"
              hide-details
              class="ml-4"
              style="max-width: 200px;"
              @update:modelValue="updateStatus"
            ></v-select>
          </template>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="detailsModal = false">Fechar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
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
const detailsModal = ref(false)
const selectedOrder = ref<any>(null)

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

function openDetailsModal(order: any) {
  selectedOrder.value = order
  detailsModal.value = true
}

async function updateStatus() {
  if (!selectedOrder.value) return;
  const orderToUpdate = selectedOrder.value;

  try {
    await api.updateOrderStatus(orderToUpdate.id, orderToUpdate.status)
    // Opcional: mostrar um snackbar de sucesso
  } catch {
    alert('Erro ao atualizar status.')
    loadOrders() // Recarrega tudo para garantir consistência em caso de erro
  }
}

async function loadOrders() {
  loading.value = true
  try {
    const { data } = await api.getOrders()
    orders.value = data
  } catch(err) {
    console.error("Falha ao carregar pedidos:", err)
    orders.value = []
  }
  finally {
    loading.value = false
  }
}

onMounted(loadOrders)
</script>
