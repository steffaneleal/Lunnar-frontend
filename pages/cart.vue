<!-- CARRINHO -->
<template>
  <v-container>
    <h1>Carrinho de Compras</h1>
    <v-card v-if="cartStore.items.length > 0">
      <v-list lines="two">
        <v-list-item v-for="item in cartStore.items" :key="item.id" :title="item.name">
          <template v-slot:subtitle>
            {{ item.quantity }} x R$ {{ formatPrice(item.price) }}
          </template>
          <template v-slot:append>
            <v-btn
              :color="hoveredItemId === item.id ? 'red' : 'grey'"
              :icon="hoveredItemId === item.id ? 'mdi-delete' : 'mdi-delete'"
              variant="text"
              @click="cartStore.removeItem(item.id)"
              @mouseover="hoveredItemId = item.id"
              @mouseleave="hoveredItemId = null"
            ></v-btn>
          </template>
        </v-list-item>
      </v-list>
      <v-divider></v-divider>
      <v-card-text class="text-right">
        <strong>Total: R$ {{ formatPrice(cartStore.totalPrice) }}</strong>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" to="/checkout">Finalizar Compra</v-btn>
      </v-card-actions>
    </v-card>
    <v-alert v-else type="info">
      Seu carrinho está vazio.
    </v-alert>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useCartStore } from '~/stores/cart'

const cartStore = useCartStore()
const hoveredItemId = ref<number | null>(null)

function formatPrice(value: number) {
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
</script>
