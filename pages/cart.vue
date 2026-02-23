<!-- CARRINHO -->
<template>
  <v-container>
    <h1>Carrinho de Compras</h1>
    <v-card v-if="cartStore.items.length > 0">
      <v-list lines="two">
        <v-list-item v-for="item in cartStore.items" :key="item.id" :title="item.name">
          <template v-slot:subtitle>
            <span class="font-weight-bold text-primary">R$ {{ formatPrice(item.price) }}</span>
            <div class="text-caption mt-1">Estoque: {{ item.stockQuantity }}</div>
          </template>
          <template v-slot:append>
            <div class="d-flex align-center">
              <v-text-field
                v-model.number="item.quantity"
                type="number"
                density="compact"
                variant="outlined"
                hide-details
                min="1"
                :max="item.stockQuantity"
                style="width: 80px;"
                @update:modelValue="(val) => cartStore.updateQuantity(item.id, Number(val))"
              ></v-text-field>
              <v-btn
                class="delete-button ml-2"
                :color="hoveredItemId === item.id ? 'red' : 'grey'"
                :icon="hoveredItemId === item.id ? 'mdi-delete-outline' : 'mdi-delete'"
                variant="text"
                @click="cartStore.removeItem(item.id)"
                @mouseover="hoveredItemId = item.id"
                @mouseleave="hoveredItemId = null"
              ></v-btn>
            </div>
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

<style scoped>
.delete-button {
  transition: color 0.3s ease;
}
</style>
