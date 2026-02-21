<!-- HOME -->
<template>
  <v-container>
    <div class="d-flex align-center mb-6">
      <h1 class="text-h4.5">Olá, <span class="text-primary"> {{ authStore.user?.name || 'Usuário' }} </span> </h1>
      <v-chip v-if="authStore.isAdmin" color="blue" class="ml-1" size="small">
        Administrador
      </v-chip>
    </div>

    <v-row>
      <v-col v-for="item in dashboardItems" :key="item.title" cols="12" sm="6" md="4">
        <v-card
          :to="item.path"
          hover
          class="fill-height pa-4 text-center cursor-pointer"
        >
          <v-card-title class="text-primary">{{ item.title }}</v-card-title>
          <v-card-subtitle>{{ item.subtitle }}</v-card-subtitle>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()

const dashboardItems = computed(() => {
  const items = [
    { title: 'Produtos', subtitle: 'Ver catálogo e estoque', path: '/products' },
    { title: 'Pedidos', subtitle: authStore.isAdmin ? 'Ver todos os pedidos' : 'Meus pedidos', path: '/orders' },
  ]

  if (authStore.isAdmin) {
    items.push({ title: 'Clientes', subtitle: 'Gestão de clientes (CRM)', path: '/customers' })
  }

  items.push({ title: 'Perfil', subtitle: 'Seus dados e perfil de cliente', path: '/profile' })

  return items
})
</script>
