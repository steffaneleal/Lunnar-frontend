<!-- ENDEREÇO -->
<template>
  <v-container>
    <h1>Finalizar Compra</h1>
    <v-card>
      <v-card-text>
        <v-form @submit.prevent="submitOrder">
          <v-text-field
            v-model="address.cep"
            label="CEP"
            required
            @blur="fetchAddress"
          ></v-text-field>
          <v-text-field
            v-model="address.street"
            label="Rua"
            required
          ></v-text-field>
          <v-text-field
            v-model="address.number"
            label="Número"
            required
          ></v-text-field>
          <v-text-field
            v-model="address.neighborhood"
            label="Bairro"
            required
          ></v-text-field>
          <v-text-field
            v-model="address.city"
            label="Cidade"
            required
          ></v-text-field>
          <v-text-field
            v-model="address.state"
            label="Estado"
            required
          ></v-text-field>
          <v-btn type="submit" color="primary" block>
            Realizar Pedido
          </v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useCartStore } from '~/stores/cart'

const cartStore = useCartStore()

const address = reactive({
  cep: '',
  street: '',
  number: '',
  neighborhood: '',
  city: '',
  state: '',
})

async function fetchAddress() {
  // TODO: Implement Google Maps API call
}

function submitOrder() {
  // TODO: Implement order submission
  console.log('Order submitted:', {
    items: cartStore.items,
    address,
  })
  cartStore.clearCart()
  // Redirect to a success page or orders page
}
</script>
