<template>
  <v-container>
    <div class="d-flex justify-space-between align-center mb-1">
      <h1 class="text-h4">Dashboard</h1>
    </div>
    <p class="text-subtitle-1 text-medium-emphasis mb-6">Visão estratégica do seu negócio</p>

    <v-progress-linear v-if="loading" indeterminate class="mb-4"></v-progress-linear>

    <template v-else>
      <!-- KPIs -->
      <v-row class="mb-4">
        <v-col cols="12" sm="6" md="3">
          <v-card rounded="lg" border>
            <v-card-text class="pa-5">
              <div class="d-flex align-center justify-space-between mb-3">
                <span class="text-caption text-medium-emphasis text-uppercase font-weight-medium">Receita Total</span>
                <v-icon color="green" size="20">mdi-currency-usd</v-icon>
              </div>
              <div class="text-h5 font-weight-bold">R$ {{ formatPrice(kpis.totalRevenue) }}</div>
              <div class="text-caption text-medium-emphasis mt-1">pedidos concluídos</div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" sm="6" md="3">
          <v-card rounded="lg" border>
            <v-card-text class="pa-5">
              <div class="d-flex align-center justify-space-between mb-3">
                <span class="text-caption text-medium-emphasis text-uppercase font-weight-medium">Ticket Médio</span>
                <v-icon color="blue" size="20">mdi-receipt</v-icon>
              </div>
              <div class="text-h5 font-weight-bold">R$ {{ formatPrice(kpis.avgTicket) }}</div>
              <div class="text-caption text-medium-emphasis mt-1">por pedido</div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" sm="6" md="3">
          <v-card rounded="lg" border>
            <v-card-text class="pa-5">
              <div class="d-flex align-center justify-space-between mb-3">
                <span class="text-caption text-medium-emphasis text-uppercase font-weight-medium">Total de Pedidos</span>
                <v-icon color="orange" size="20">mdi-package-variant</v-icon>
              </div>
              <div class="text-h5 font-weight-bold">{{ kpis.totalOrders }}</div>
              <div class="text-caption text-medium-emphasis mt-1">{{ kpis.pendingOrders }} pendentes</div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" sm="6" md="3">
          <v-card rounded="lg" border>
            <v-card-text class="pa-5">
              <div class="d-flex align-center justify-space-between mb-3">
                <span class="text-caption text-medium-emphasis text-uppercase font-weight-medium">Clientes Ativos</span>
                <v-icon color="purple" size="20">mdi-account-group</v-icon>
              </div>
              <div class="text-h5 font-weight-bold">{{ kpis.totalCustomers }}</div>
              <div class="text-caption text-medium-emphasis mt-1">com pelo menos 1 pedido</div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-row>
        <!-- Clientes de Alto Valor -->
        <v-col cols="12" md="6">
          <v-card rounded="lg" border height="100%">
            <v-card-title class="pa-5 pb-3 d-flex align-center gap-2">
              <v-icon class="mr-1" color="amber-darken-2" size="22">mdi-crown</v-icon>
              Clientes de Alto Valor
            </v-card-title>
            <v-divider></v-divider>
            <v-list density="compact" class="pa-2">
              <v-list-item
                  v-for="(c, i) in topCustomers"
                  :key="c.id"
                  rounded="lg"
                  class="mb-1"
              >
                <template v-slot:prepend>
                  <v-avatar
                      :color="i === 0 ? 'amber-darken-2' : i === 1 ? 'grey-lighten-1' : i === 2 ? 'deep-orange-lighten-2' : 'grey-lighten-3'"
                      size="36"
                  >
                    <span class="text-caption font-weight-bold" :class="i < 3 ? 'text-white' : 'text-grey'">{{ i + 1 }}</span>
                  </v-avatar>
                </template>
                <v-list-item-title class="font-weight-medium">{{ c.name }}</v-list-item-title>
                <v-list-item-subtitle>{{ c.orders }} pedidos</v-list-item-subtitle>
                <template v-slot:append>
                  <div class="text-right">
                    <div class="text-body-2 font-weight-bold text-green">R$ {{ formatPrice(c.total) }}</div>
                    <v-chip size="x-small" :color="c.orders >= 5 ? 'green' : c.orders >= 3 ? 'blue' : 'grey'" variant="tonal" class="mt-1">
                      {{ c.orders >= 5 ? 'VIP' : c.orders >= 3 ? 'Recorrente' : 'Novo' }}
                    </v-chip>
                  </div>
                </template>
              </v-list-item>
              <v-list-item v-if="topCustomers.length === 0">
                <v-list-item-title class="text-medium-emphasis">Nenhum dado disponível</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-card>
        </v-col>

        <!-- Reposição de Estoque -->
        <v-col cols="12" md="6">
          <v-card rounded="lg" border height="100%">
            <v-card-title class="pa-5 pb-3 d-flex align-center gap-2">
              <v-icon class="mr-1" color="red" size="22">mdi-alert-circle</v-icon>
              Projeção de Reposição de Estoque
            </v-card-title>
            <v-divider></v-divider>
            <v-list density="compact" class="pa-2">
              <v-list-item
                  v-for="p in stockAlert"
                  :key="p.id"
                  rounded="lg"
                  class="mb-1"
              >
                <template v-slot:prepend>
                  <v-avatar rounded="md" size="36" color="grey-lighten-3">
                    <v-img v-if="p.imageUrl" :src="p.imageUrl" cover></v-img>
                    <v-icon v-else size="18" color="grey">mdi-package-variant</v-icon>
                  </v-avatar>
                </template>
                <v-list-item-title class="font-weight-medium">{{ p.name }}</v-list-item-title>
                <v-list-item-subtitle>{{ p.sold }} vendidos nos últimos 30 dias</v-list-item-subtitle>
                <template v-slot:append>
                  <div class="text-right">
                    <div class="text-body-2 font-weight-bold" :class="p.stock <= 0 ? 'text-red' : p.stock <= p.daysLeft * 0.5 ? 'text-orange' : 'text-grey'">
                      {{ p.stock }} em estoque
                    </div>
                    <v-chip
                        size="x-small"
                        :color="p.stock <= 0 ? 'red' : p.daysLeft <= 7 ? 'orange' : 'blue'"
                        variant="tonal"
                        class="mt-1"
                    >
                      {{ p.stock <= 0 ? 'Sem estoque' : `~${p.daysLeft}d restantes` }}
                    </v-chip>
                  </div>
                </template>
              </v-list-item>
              <v-list-item v-if="stockAlert.length === 0">
                <v-list-item-title class="text-medium-emphasis">Estoque saudável em todos os produtos</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-card>
        </v-col>

        <!-- Comportamento por Região -->
        <v-col cols="12" md="6">
          <v-card rounded="lg" border height="100%">
            <v-card-title class="pa-5 pb-3 d-flex align-center gap-2">
              <v-icon class="mr-1" color="teal" size="22">mdi-map-marker</v-icon>
              Receita por Região
            </v-card-title>
            <v-divider></v-divider>
            <v-card-text class="d-flex align-center justify-center pa-4">
              <div v-if="regionData.length === 0" class="text-medium-emphasis text-center py-4">
                Nenhum dado de endereço disponível
              </div>
              <div v-else style="height: 300px; width: 100%;">
                <PieChart :chart-data="regionChartData" />
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Status dos Pedidos -->
        <v-col cols="12" md="6">
          <v-card rounded="lg" border>
            <v-card-title class="pa-5 pb-3 d-flex align-center gap-2">
              <v-icon class="mr-1" color="indigo" size="22">mdi-chart-donut</v-icon>
              Distribuição de Pedidos por Status
            </v-card-title>
            <v-divider></v-divider>
            <v-card-text class="pa-4">
              <div v-for="s in ordersByStatus" :key="s.status" class="mb-4">
                <div class="d-flex justify-space-between align-center mb-1">
                  <div class="d-flex align-center gap-2">
                    <v-icon :color="s.color" size="16">{{ s.icon }}</v-icon>
                    <span class="font-weight-medium">{{ s.label }}</span>
                  </div>
                  <span class="text-body-2 font-weight-bold">{{ s.count }}</span>
                </div>
                <v-progress-linear
                    :model-value="s.percentage"
                    :color="s.color"
                    rounded
                    height="8"
                    bg-color="grey-lighten-3"
                ></v-progress-linear>
                <div class="text-right mt-1">
                  <span class="text-caption text-medium-emphasis">{{ s.percentage.toFixed(1) }}%</span>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Insights da IA -->
      <v-row v-if="aiInsights" class="mt-2">
        <v-col cols="12">
          <v-card rounded="lg" border color="primary" variant="tonal">
            <v-card-title class="pa-5 pb-3 d-flex align-center gap-2">
              <v-icon color="primary" size="22">mdi-brain</v-icon>
              Análise Estratégica — IA
            </v-card-title>
            <v-divider></v-divider>
            <v-card-text class="pa-5">
              <div v-for="(insight, i) in parsedInsights" :key="i" class="mb-4 last-mb-0">
                <div class="d-flex align-start gap-3">
                  <v-icon :color="insight.color" size="20" class="mt-1 flex-shrink-0">{{ insight.icon }}</v-icon>
                  <div>
                    <div class="font-weight-semibold text-body-1 mb-1">{{ insight.title }}</div>
                    <div class="text-body-2 text-medium-emphasis">{{ insight.body }}</div>
                  </div>
                </div>
                <v-divider v-if="i < parsedInsights.length - 1" class="mt-4"></v-divider>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </template>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="4000" location="bottom right">
      {{ snackbar.message }}
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useApi } from '~/services/api'
import { navigateTo } from 'nuxt/app'
import PieChart from '~/components/PieChart.vue'

const authStore = useAuthStore()
const api = useApi()

const loading = ref(true)
const loadingAI = ref(false)
const aiInsights = ref<string | null>(null)
const snackbar = ref({ show: false, message: '', color: 'success' })

const allOrders = ref<any[]>([])
const allCustomers = ref<any[]>([])
const allProducts = ref<any[]>([])

// Redireciona se não for admin
onMounted(async () => {
  if (!authStore.isAdmin) {
    navigateTo('/')
    return
  }
  await loadData()
})

async function loadData() {
  loading.value = true
  try {
    const [ordersRes, customersRes, productsRes] = await Promise.all([
      api.getOrders(),
      api.getCustomers(),
      api.getProducts(),
    ])
    allOrders.value = ordersRes.data
    allCustomers.value = customersRes.data
    allProducts.value = productsRes.data
  } catch {
    snackbar.value = { show: true, message: 'Erro ao carregar dados.', color: 'error' }
  } finally {
    loading.value = false
  }
}

// KPIs
const kpis = computed(() => {
  const concluded = allOrders.value.filter(o => o.status === 'CONCLUIDO')
  const totalRevenue = concluded.reduce((s, o) => s + Number(o.totalPrice), 0)
  const avgTicket = concluded.length ? totalRevenue / concluded.length : 0
  const pendingOrders = allOrders.value.filter(o => o.status === 'PENDENTE').length
  const customersWithOrders = new Set(allOrders.value.map(o => o.userId)).size
  return {
    totalRevenue,
    avgTicket,
    totalOrders: allOrders.value.length,
    pendingOrders,
    totalCustomers: customersWithOrders,
  }
})

// Top clientes por receita
const topCustomers = computed(() => {
  const map: Record<string, { id: string; name: string; email: string; total: number; orders: number }> = {}
  for (const order of allOrders.value) {
    if (order.status === 'CANCELADO' || order.status === 'CANCELADO_PELO_CLIENTE') continue
    if (!map[order.userId]) {
      map[order.userId] = { id: order.userId, name: order.userName, email: order.userEmail, total: 0, orders: 0 }
    }
    map[order.userId].total += Number(order.totalPrice)
    map[order.userId].orders++
  }
  return Object.values(map).sort((a, b) => b.total - a.total).slice(0, 6)
})

// Reposição de estoque
const stockAlert = computed(() => {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const soldMap: Record<string, number> = {}
  for (const order of allOrders.value) {
    if (order.status === 'CANCELADO' || order.status === 'CANCELADO_PELO_CLIENTE') continue
    if (new Date(order.createdAt) < thirtyDaysAgo) continue
    for (const item of order.items || []) {
      soldMap[item.productId] = (soldMap[item.productId] || 0) + item.quantity
    }
  }

  return allProducts.value
      .map(p => {
        const sold = soldMap[p.id] || 0
        const dailyRate = sold / 30
        const daysLeft = dailyRate > 0 ? Math.floor(p.stockQuantity / dailyRate) : 999
        return { id: p.id, name: p.name, imageUrl: p.imageUrl, stock: p.stockQuantity, sold, daysLeft }
      })
      .filter(p => p.stock <= 10 || p.daysLeft <= 14)
      .sort((a, b) => a.daysLeft - b.daysLeft)
      .slice(0, 6)
})

// Comportamento por região
const regionData = computed(() => {
  const map: Record<string, { orders: number; revenue: number }> = {}
  for (const order of allOrders.value) {
    if (order.status === 'CANCELADO' || order.status === 'CANCELADO_PELO_CLIENTE') continue
    const state = order.shippingAddress?.state
    if (!state) continue
    if (!map[state]) map[state] = { orders: 0, revenue: 0 }
    map[state].orders++
    map[state].revenue += Number(order.totalPrice)
  }

  const colors = ['#009688', '#2196F3', '#3F51B5', '#9C27B0', '#00BCD4', '#673AB7']
  const totalRevenue = Object.values(map).reduce((s, r) => s + r.revenue, 0)

  return Object.entries(map)
      .map(([state, data], i) => ({
        state,
        orders: data.orders,
        revenue: data.revenue,
        avgTicket: data.orders ? data.revenue / data.orders : 0,
        percentage: totalRevenue ? (data.revenue / totalRevenue) * 100 : 0,
        color: colors[i % colors.length],
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
})

const regionChartData = computed(() => {
  return {
    labels: regionData.value.map(r => r.state),
    datasets: [
      {
        backgroundColor: regionData.value.map(r => r.color),
        data: regionData.value.map(r => r.revenue)
      }
    ]
  }
})

// Distribuição por status
const ordersByStatus = computed(() => {
  const statuses = [
    { status: 'PENDENTE', label: 'Pendente', color: 'orange', icon: 'mdi-clock-outline' },
    { status: 'PAGO', label: 'Pago', color: 'blue', icon: 'mdi-check-circle-outline' },
    { status: 'ENVIADO', label: 'Enviado', color: 'cyan', icon: 'mdi-truck-outline' },
    { status: 'CONCLUIDO', label: 'Concluído', color: 'green', icon: 'mdi-check-all' },
    { status: 'CANCELADO', label: 'Cancelado', color: 'red', icon: 'mdi-close-circle-outline' },
    { status: 'CANCELADO_PELO_CLIENTE', label: 'Cancelado pelo cliente', color: 'red-darken-3', icon: 'mdi-account-remove-outline' },
  ]
  const total = allOrders.value.length || 1
  return statuses.map(s => ({
    ...s,
    count: allOrders.value.filter(o => o.status === s.status).length,
    percentage: (allOrders.value.filter(o => o.status === s.status).length / total) * 100,
  })).filter(s => s.count > 0)
})

// Insights da IA
const parsedInsights = computed(() => {
  if (!aiInsights.value) return []
  const lines = aiInsights.value.split('\n').filter(l => l.trim())
  const insights: { title: string; body: string; icon: string; color: string }[] = []
  const icons = ['mdi-lightbulb-outline', 'mdi-trending-up', 'mdi-alert-outline', 'mdi-star-outline', 'mdi-chart-line']
  const colors = ['primary', 'green', 'orange', 'purple', 'teal']

  let current: { title: string; body: string } | null = null
  for (const line of lines) {
    if (line.startsWith('**') || line.startsWith('##') || /^\d+\./.test(line)) {
      if (current) insights.push({ ...current, icon: icons[insights.length % icons.length], color: colors[insights.length % colors.length] })
      current = { title: line.replace(/\*\*/g, '').replace(/##/g, '').replace(/^\d+\.\s*/, '').trim(), body: '' }
    } else if (current) {
      current.body += (current.body ? ' ' : '') + line.trim()
    }
  }
  if (current) insights.push({ ...current, icon: icons[insights.length % icons.length], color: colors[insights.length % colors.length] })

  return insights.slice(0, 5)
})

async function generateInsights() {
  loadingAI.value = true
  try {
    const context = {
      kpis: kpis.value,
      topCustomers: topCustomers.value.slice(0, 5),
      stockAlert: stockAlert.value.slice(0, 5),
      regionData: regionData.value,
      ordersByStatus: ordersByStatus.value,
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: `Você é um consultor estratégico de negócios. Analise os dados abaixo de um e-commerce brasileiro e forneça exatamente 4 insights estratégicos numerados (1. 2. 3. 4.) em português. Cada insight deve ter um título em negrito (**título**) seguido de uma análise objetiva de 2-3 linhas com recomendação prática. Seja direto e específico com os números.

Dados:
${JSON.stringify(context, null, 2)}`,
        }],
      }),
    })

    const data = await response.json()
    aiInsights.value = data.content?.[0]?.text || 'Não foi possível gerar insights.'
  } catch {
    snackbar.value = { show: true, message: 'Erro ao gerar insights com IA.', color: 'error' }
  } finally {
    loadingAI.value = false
  }
}

function formatPrice(v: number) {
  return v != null ? Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'
}
</script>
