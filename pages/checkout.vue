<template>
  <v-container>
    <h1>Finalizar Compra</h1>

    <v-card>
      <v-card-title>Endereço de Entrega</v-card-title>
      <v-card-text>
        <v-progress-circular v-if="loadingAddresses" indeterminate></v-progress-circular>

        <v-radio-group v-model="selectedAddressId" v-else-if="addresses.length > 0">
          <v-radio v-for="addr in addresses" :key="addr.id" :value="addr.id">
            <template v-slot:label>
              <div>
                <strong>{{ addr.street }}, {{ addr.number }}</strong> - {{ addr.neighborhood }}, {{ addr.city }} - {{ addr.state }}
                <div class="text-grey">{{ addr.zip_code }}</div>
              </div>
            </template>
          </v-radio>
        </v-radio-group>

        <v-alert v-else type="info" variant="tonal" class="mb-4">
          Nenhum endereço cadastrado. Adicione um endereço para continuar.
        </v-alert>

        <v-btn variant="text" @click="addressModal = true">
          {{ addresses.length > 0 ? 'Adicionar ou alterar endereço' : 'Adicionar endereço' }}
        </v-btn>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
            color="primary"
            @click="submitOrder"
            :disabled="!selectedAddressId"
            :loading="submittingOrder"
        >
          Realizar Pedido
        </v-btn>
      </v-card-actions>
    </v-card>

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
import { useCartStore } from '~/stores/cart'
import { useApi } from '~/services/api'
import AddressForm from '~/components/AddressForm.vue'

const cartStore = useCartStore()
const api = useApi()
const router = useRouter()

const addresses = ref<any[]>([])
const selectedAddressId = ref<string | null>(null)
const loadingAddresses = ref(true)
const submittingOrder = ref(false)
const addressModal = ref(false)
const error = ref('')

async function loadAddresses() {
  loadingAddresses.value = true
  try {
    // Garante que o Customer existe (cria automaticamente se for a primeira vez do usuário)
    await api.getMyProfile()
    const { data } = await api.getMyAddresses()
    addresses.value = data
    if (data.length > 0) {
      selectedAddressId.value = data[0].id // Seleciona o primeiro por padrão
    }
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
    selectedAddressId.value = newAddress.id // Seleciona o endereço recém-criado
    addressModal.value = false // Fecha o modal
  } catch (err) {
    console.error("Erro ao adicionar endereço:", err)
    // Opcional: mostrar um alerta de erro para o usuário
  }
}

async function submitOrder() {
  error.value = ''
  if (!selectedAddressId.value) {
    error.value = 'Por favor, selecione um endereço de entrega.'
    return
  }
  if (cartStore.items.length === 0) {
    error.value = 'Seu carrinho está vazio.'
    return
  }

  submittingOrder.value = true
  try {
    const orderPayload = {
      items: cartStore.items.map(item => ({
        productId: item.id,
        quantity: item.quantity,
      })),
      addressId: selectedAddressId.value
    }

    await api.createOrder(orderPayload)

    cartStore.clearCart()

    router.push('/orders')

  } catch (err) {
    error.value = 'Ocorreu um erro ao finalizar o pedido. Tente novamente.'
    console.error(err)
  } finally {
    submittingOrder.value = false
  }
}

onMounted(loadAddresses)
</script>