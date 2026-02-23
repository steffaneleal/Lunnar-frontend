<!-- ADMIN - VIEW DOS CLIENTES -->
<template>
  <v-container>
    <h1 class="text-h4 mb-2">Clientes (CRM)</h1>
    <p class="text-subtitle-1 text-medium-emphasis mb-6">Gestão de relacionamento com clientes</p>

    <v-row v-if="loading">
      <v-col class="text-center"><v-progress-circular indeterminate></v-progress-circular></v-col>
    </v-row>

    <v-alert v-else-if="customers.length === 0" type="info" variant="tonal">
      Nenhum cliente cadastrado.
    </v-alert>

    <v-row v-else>
      <v-col v-for="c in customers" :key="c.id" cols="12" md="6" lg="4">
        <v-card height="100%">
          <v-card-title class="d-flex justify-space-between align-center">
            <span class="text-truncate">{{ c.userName }}</span>
            <div class="ml-2">
              <v-btn
                icon="mdi-chart-bar"
                size="small"
                variant="text"
                color="primary"
                @click="openReport(c)"
                title="Relatório"
              ></v-btn>
              <v-btn
                :icon="hoveredEditId === c.id ? 'mdi-pencil' : 'mdi-pencil'"
                size="small"
                variant="text"
                :color="hoveredEditId === c.id ? 'secondary' : 'grey'"
                @click="openEdit(c)"
                title="Editar"
                @mouseover="hoveredEditId = c.id"
                @mouseleave="hoveredEditId = null"
                class="edit-button"
              ></v-btn>
            </div>
          </v-card-title>
          <v-card-subtitle v-if="c.companyName" class="company-subtitle pb-0">{{ c.companyName }}</v-card-subtitle>
          <v-card-text>
            <p class="mb-1"><strong>E-mail:</strong> {{ c.userEmail }}</p>
            <p v-if="c.phoneNumber" class="mb-1"><strong>Telefone:</strong> {{ formatPhone(c.phoneNumber) }}</p>
            <v-sheet
              v-if="c.notes"
              color="surface-variant"
              class="pa-2 rounded mt-2 mb-2 text-body-2"
            >
              {{ c.notes }}
            </v-sheet>
            <div v-if="c.lastContactAt" class="text-caption text-disabled mt-2">
              Último contato: {{ formatDate(c.lastContactAt) }}
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Modal Relatório -->
    <v-dialog v-model="reportModal" max-width="800" scrollable>
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          Relatório: {{ report?.customerName }}
          <v-btn color="primary" size="small" @click="exportReportCsv" :disabled="!report">
            Exportar CSV
          </v-btn>
        </v-card-title>
        <v-card-text style="max-height: 70vh;">
          <div v-if="reportLoading" class="text-center pa-4">
            <v-progress-circular indeterminate></v-progress-circular>
          </div>
          <template v-else-if="report">
            <div class="mb-6">
              <h3 class="text-subtitle-1 text-primary mb-2">Resumo</h3>
              <v-row dense>
                <v-col cols="6" sm="3"><strong>Total pedidos:</strong> {{ report.totalOrders }}</v-col>
                <v-col cols="6" sm="3"><strong>Total gasto:</strong> R$ {{ formatPrice(report.totalSpent) }}</v-col>
                <v-col cols="6" sm="3"><strong>Ticket médio:</strong> R$ {{ formatPrice(report.averageOrderValue) }}</v-col>
                <v-col cols="6" sm="3" v-if="report.lastPurchaseAt">
                  <strong>Última:</strong> {{ formatDate(report.lastPurchaseAt) }}
                </v-col>
              </v-row>
            </div>

            <div class="mb-6">
              <h3 class="text-subtitle-1 text-primary mb-2">Por categoria</h3>
              <v-table density="compact" v-if="report.byCategory?.length">
                <thead>
                  <tr><th>Categoria</th><th>Pedidos</th><th>Qtd</th><th>Valor</th></tr>
                </thead>
                <tbody>
                  <tr v-for="cat in report.byCategory" :key="cat.categoryName">
                    <td>{{ cat.categoryName }}</td>
                    <td>{{ cat.orderCount }}</td>
                    <td>{{ cat.totalQuantity }}</td>
                    <td>R$ {{ formatPrice(cat.totalValue) }}</td>
                  </tr>
                </tbody>
              </v-table>
              <p v-else class="text-caption text-disabled">Nenhuma compra por categoria.</p>
            </div>

            <div class="mb-6">
              <h3 class="text-subtitle-1 text-primary mb-2">Tendência: dias de compra</h3>
              <div v-for="d in report.byDayOfWeek" :key="d.dayName" class="d-flex align-center mb-1">
                <div style="width: 80px" class="text-caption">{{ d.dayName }}</div>
                <v-progress-linear
                  :model-value="dayBarWidth(d.orderCount)"
                  color="primary"
                  height="15"
                  class="flex-grow-1 mx-2"
                ></v-progress-linear>
                <div style="width: 30px" class="text-caption text-right">{{ d.orderCount }}</div>
              </div>
            </div>

            <div>
              <h3 class="text-subtitle-1 text-primary mb-2">Últimos pedidos</h3>
              <v-table density="compact" v-if="report.ordersSummary?.length">
                <thead>
                  <tr><th>Data</th><th>Total</th><th>Status</th></tr>
                </thead>
                <tbody>
                  <tr v-for="o in report.ordersSummary?.slice(0, 10)" :key="o.orderId">
                    <td>{{ formatDate(o.createdAt) }}</td>
                    <td>R$ {{ formatPrice(o.totalPrice) }}</td>
                    <td>{{ o.status }}</td>
                  </tr>
                </tbody>
              </v-table>
              <p v-else class="text-caption text-disabled">Nenhum pedido.</p>
            </div>
          </template>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="reportModal = false">Fechar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Modal Editar -->
    <v-dialog v-model="showModal" max-width="500">
      <v-card>
        <v-card-title>Editar cliente</v-card-title>
        <v-card-text>
          <v-form @submit.prevent="saveCustomer">
            <v-text-field
              v-model="editForm.companyName"
              label="Empresa"
              variant="outlined"
              class="mb-2"
            ></v-text-field>
            <v-textarea
              v-model="editForm.notes"
              label="Notas / Relacionamento"
              rows="4"
              variant="outlined"
              class="mb-2"
            ></v-textarea>
            <v-text-field
              v-model="editForm.lastContactAt"
              label="Último contato"
              type="datetime-local"
              variant="outlined"
            ></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="showModal = false">Cancelar</v-btn>
          <v-btn color="primary" @click="saveCustomer">Salvar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useApi } from '~/services/api'
import Swal from 'sweetalert2'

const api = useApi()

const customers = ref<any[]>([])
const loading = ref(true)
const showModal = ref(false)
const editingId = ref<string | null>(null)
const editForm = reactive({ companyName: '', notes: '', lastContactAt: '' })
const reportModal = ref(false)
const report = ref<any>(null)
const reportLoading = ref(false)
const hoveredEditId = ref<string | null>(null)

function formatPhone(phone: string) {
  if (!phone) return ''
  const digits = phone.replace(/\D/g, '')
  if (digits.length <= 10) {
    return digits.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
  } else {
    return digits.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  }
}

function formatDate(d: string) {
  if (!d) return '—'
  return new Date(d).toLocaleString('pt-BR')
}
function formatPrice(v: any) {
  if (v == null) return '0,00'
  return Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 })
}
function dayBarWidth(count: number) {
  if (!report.value?.byDayOfWeek?.length) return 0
  const max = Math.max(1, ...report.value.byDayOfWeek.map((x: any) => x.orderCount))
  return max === 0 ? 0 : (count / max) * 100
}

async function openReport(c: any) {
  reportModal.value = true
  report.value = null
  reportLoading.value = true
  try {
    const { data } = await api.getCustomerReport(c.id)
    report.value = data
  } catch {
    alert('Erro ao carregar relatório.')
    reportModal.value = false
  } finally {
    reportLoading.value = false
  }
}

function exportReportCsv() {
  if (!report.value) return
  const r = report.value
  const rows: any[][] = [
    ['Relatório do Cliente'],
    ['Nome', r.customerName],
    ['E-mail', r.customerEmail],
    ['Total de pedidos', r.totalOrders],
    ['Total gasto', 'R$ ' + formatPrice(r.totalSpent)],
    ['Ticket médio', 'R$ ' + formatPrice(r.averageOrderValue)],
    [],
    ['Por categoria', 'Pedidos', 'Qtd itens', 'Valor'],
  ]
  if (r.byCategory?.length) {
    r.byCategory.forEach((c: any) =>
      rows.push([c.categoryName, c.orderCount, c.totalQuantity, 'R$ ' + formatPrice(c.totalValue)])
    )
  }
  rows.push([], ['Dia da semana', 'Pedidos'])
  if (r.byDayOfWeek?.length) {
    r.byDayOfWeek.forEach((d: any) => rows.push([d.dayName, d.orderCount]))
  }
  rows.push([], ['Data', 'Total', 'Status'])
  if (r.ordersSummary?.length) {
    r.ordersSummary.forEach((o: any) =>
      rows.push([formatDate(o.createdAt), 'R$ ' + formatPrice(o.totalPrice), o.status])
    )
  }
  const csv = rows
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(';'))
    .join('\n')
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `relatorio-${(r.customerName || 'cliente').replace(/\s+/g, '-')}.csv`
  a.click()
  URL.revokeObjectURL(a.href)
}

async function loadCustomers() {
  loading.value = true
  try {
    const { data } = await api.getCustomers()
    customers.value = data.filter((c: any) => c.userRole !== 'ADMIN')
  } finally {
    loading.value = false
  }
}

function openEdit(c: any) {
  editingId.value = c.id
  editForm.companyName = c.companyName || ''
  editForm.notes = c.notes || ''
  editForm.lastContactAt = c.lastContactAt
    ? new Date(c.lastContactAt).toISOString().slice(0, 16)
    : ''
  showModal.value = true
}

async function saveCustomer() {
  try {
    const payload = {
      companyName: editForm.companyName || null,
      notes: editForm.notes || null,
      lastContactAt: editForm.lastContactAt ? new Date(editForm.lastContactAt).toISOString() : null,
    }
    await api.updateCustomer(editingId.value!, payload)
    showModal.value = false
    loadCustomers()
  } catch {
    alert('Erro ao salvar.')
  }
}

onMounted(loadCustomers)
</script>

<style scoped>
.company-subtitle {
  margin-top: -15px;
}
</style>
