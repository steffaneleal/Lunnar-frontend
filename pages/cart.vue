<!-- CARRINHO -->
<template>
  <v-container>
    <h1>Carrinho de Compras</h1>
    <v-card v-if="cartStore.items.length > 0">
      <v-list>
        <v-list-item v-for="item in cartStore.items" :key="item.id">
          <v-list-item-content>
            <v-list-item-title>{{ item.name }}</v-list-item-title>
            <v-list-item-subtitle>
              {{ item.quantity }} x R$ {{ item.price.toFixed(2) }}
            </v-list-item-subtitle>
          </v-list-item-content>
          <v-list-item-action>
            <v-btn icon @click="cartStore.removeItem(item.id)">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </v-list-item-action>
        </v-list-item>
      </v-list>
      <v-divider></v-divider>
      <v-card-text class="text-right">
        <strong>Total: R$ {{ cartStore.totalPrice.toFixed(2) }}</strong>
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
import { useCartStore } from '~/stores/cart'

const cartStore = useCartStore()
</script>
