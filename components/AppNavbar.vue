<template>
  <v-app-bar color="#1c64c4" theme="light" flat border="b">
    <v-container class="d-flex align-center py-0">
      <NuxtLink to="/" class="d-flex align-center text-decoration-none text-h6 font-weight-regular text-primary mr-8 text-white">
        <v-img
            src="/lunnar-icon.png"
            alt="Lunnar Logo"
            width="32"
            height="32"
            class="mr-0.2"
        ></v-img>
        <span class="text-white opacity-90">Lunnar</span>
      </NuxtLink>

      <v-btn variant="text" to="/">Início</v-btn>
      <v-btn variant="text" to="/products">Produtos</v-btn>
      <v-btn variant="text" to="/orders">Pedidos</v-btn>
      <v-btn v-if="authStore.isAdmin" variant="text" to="/dashboard">Dashboard</v-btn>
      <v-btn v-if="authStore.isAdmin" variant="text" to="/customers">Clientes</v-btn>
      <v-btn v-if="authStore.isAdmin" variant="text" to="/admin">Administrador</v-btn>
      <v-spacer></v-spacer>
      <v-btn v-if="!authStore.isAdmin" to="/cart" icon>
        <v-badge :content="cartStore.itemCount" color="red">
          <v-icon>mdi-cart</v-icon>
        </v-badge>
      </v-btn>
      <v-btn variant="text" to="/profile" class="mr-2">Perfil</v-btn>
      <v-btn color="error" variant="tonal" size="small" @click="handleLogout">Sair</v-btn>
    </v-container>
  </v-app-bar>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useCartStore } from '~/stores/cart'

const authStore = useAuthStore()
const cartStore = useCartStore()
const router = useRouter()

function handleLogout() {
  authStore.logout()
  router.push('/login')
}
</script>