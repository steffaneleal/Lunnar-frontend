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

            <!-- Se for Admin E o status for editável, mostra o dropdown -->
            <v-select
              v-if="authStore.isAdmin && order.status !== 'CANCELADO_PELO_CLIENTE'"
              v-model="order.status"
              :items="['PENDENTE', 'PAGO', 'ENVIADO', 'CONCLUIDO', 'CANCELADO']"
              density="compact"
              variant="outlined"
              hide-details
              style="max-width: 180px; font-weight: normal;"
              @update:modelValue="updateStatus(order)"
            ></v-select>

            <!-- Se for Cliente OU se o status for cancelado pelo cliente, mostra o chip -->
            <v-chip v-else :color="getStatusColor(order.status)" size="small" variant="tonal">
              {{ getStatusText(order.status) }}
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
            {{ getStatusText(selectedOrder.status) }}
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
              <template v-slot:prepend>
                <v-avatar size="40" rounded="0" class="mr-4">
                  <v-img :src="item.productImageUrl || 'https://via.placeholder.com/150'"></v-img>
                </v-avatar>
              </template>
              <v-list-item-title>{{ item.productName }}</v-list-item-title>
              <v-list-item-subtitle>
                {{ item.quantity }} x R$ {{ formatPrice(item.price || item.subtotal) }}
              </v-list-item-subtitle>
            </v-list-item>
          </v-list>

          <v-divider class="my-3"></v-divider>

          <div class="text-h6 font-weight-bold text-right">
            Total: R$ {{ formatPrice(selectedOrder.totalPrice) }}
          </div>
        </v-card-text>

        <v-card-actions class="pa-4">
          <!-- Ação do Cliente -->
          <v-btn
            v-if="!authStore.isAdmin && selectedOrder.status === 'PENDENTE'"
            color="red"
            variant="text"
            @click="confirmCancelOrder"
          >
            Cancelar Pedido
          </v-btn>

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
import Swal from 'sweetalert2'

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
    case 'CANCELADO_PELO_CLIENTE': return 'red-darken-3'
    case 'CANCELADO': return 'red'
    default: return 'grey'
  }
}

function getStatusText(status: string) {
  if (status === 'CANCELADO_PELO_CLIENTE') return 'CANCELADO PELO CLIENTE';
  return status;
}

function openDetailsModal(order: any) {
  selectedOrder.value = { ...order }
  detailsModal.value = true
}

async function updateStatus(order: any) {
  try {
    await api.updateOrderStatus(order.id, order.status)
  } catch {
    alert('Erro ao atualizar status.')
    loadOrders()
  }
}

async function confirmCancelOrder() {
  detailsModal.value = false

  const result = await Swal.fire({
    title: 'Você tem certeza?',
    text: "Deseja realmente cancelar este pedido?",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Sim, cancelar!',
    cancelButtonText: 'Não'
  })

  if (result.isConfirmed) {
    try {
      await api.cancelOrder(selectedOrder.value.id)

      const index = orders.value.findIndex(o => o.id === selectedOrder.value.id)
      if (index !== -1) {
        orders.value[index].status = 'CANCELADO_PELO_CLIENTE'
      }

      Swal.fire(
        'Cancelado!',
        'Seu pedido foi cancelado.',
        'success'
      )
    } catch (err) {
      Swal.fire(
        'Erro!',
        'Não foi possível cancelar o pedido. Tente novamente.',
        'error'
      )
    }
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
