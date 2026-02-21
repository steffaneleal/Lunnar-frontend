<!-- PRODUTOS -->
<template>
  <v-container>
    <v-row class="mb-2" align="center">
      <v-col>
        <h1 class="text-h4">Produtos</h1>
      </v-col>
      <v-col cols="auto" v-if="authStore.isAdmin">
        <v-btn color="primary" prepend-icon="mdi-plus" @click="openNewProduct">Novo produto</v-btn>
      </v-col>
    </v-row>

    <!-- Filtros -->
    <v-row class="mb-2 align-center">
      <!-- Buscar por nome -->
      <v-col cols="12" md="5">
        <v-text-field
          v-model="search"
          label="Buscar por nome"
          variant="outlined"
          density="compact"
          hide-details
          @keyup.enter="applyFilters"
        ></v-text-field>
      </v-col>

      <!-- Selecionar categoria -->
      <v-col cols="12" md="3">
        <v-select
          v-model="categoryId"
          :items="categories"
          item-title="name"
          item-value="id"
          label="Todas as categorias"
          variant="outlined"
          density="compact"
          hide-details
          clearable
        ></v-select>
      </v-col>

      <!-- Ordenar por preço -->
      <v-col cols="12" md="3">
        <v-select
          v-model="sortBy"
          :items="sortOptions"
          item-title="text"
          item-value="value"
          label="Ordenar por"
          variant="outlined"
          density="compact"
          hide-details
          clearable
        ></v-select>
      </v-col>

      <!-- Botão de filtrar -->
      <v-col cols="12" md="1">
        <v-btn block color="secondary" variant="tonal" @click="applyFilters">Filtrar</v-btn>
      </v-col>
    </v-row>

    <v-row v-if="loading">
      <v-col class="text-center"><v-progress-circular indeterminate></v-progress-circular></v-col>
    </v-row>

    <!-- Card de Produto -->
    <v-row v-else>
      <v-col v-for="p in products" :key="p.id" cols="12" sm="6" md="3" lg="3">
        <v-card height="100%" class="d-flex flex-column">
          <v-img
            :src="p.imageUrl || 'https://via.placeholder.com/300x200'"
            height="140px"
            cover
          ></v-img>
          <v-card-title class="d-flex align-center">
            <span>{{ p.name }}</span>
            <v-chip size="small" class="ml-2" v-if="p.categoryName">{{ p.categoryName }}</v-chip>
          </v-card-title>
          <v-card-subtitle class="text-primary font-weight-bold">
            R$ {{ formatPrice(p.price) }}
          </v-card-subtitle>
          <v-card-text class="flex-grow-1">
            <div class="text-body-2 text-medium-emphasis mb-2 ">{{ p.description || '—' }}</div>
            <div class="d-flex align-center">
              <div class="text-caption">Estoque: {{ p.stockQuantity }}</div>
              <v-spacer></v-spacer>
              <v-text-field
                v-if="!authStore.isAdmin"
                v-model.number="p.quantityToAdd"
                type="number"
                density="compact"
                variant="outlined"
                hide-details
                min="1"
                :max="p.stockQuantity"
                class="quantity-input"
                style="max-width: 50px;"
              ></v-text-field>
            </div>
          </v-card-text>
          <v-card-actions>
            <template v-if="authStore.isAdmin">
              <v-btn variant="text" color="secondary" @click="openEdit(p)">Editar</v-btn>
              <v-spacer></v-spacer>
              <v-btn variant="text" color="error" @click="confirmDelete(p)">Excluir</v-btn>
            </template>
            <template v-else>
              <v-btn
                block
                color="primary"
                variant="tonal"
                @click="addToCart(p)"
                :disabled="p.stockQuantity < 1"
              >
                Adicionar ao carrinho
              </v-btn>
            </template>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- Toast: produto adicionado -->
    <v-snackbar v-model="showSnackbar" timeout="3000">
      {{ addedMessage }}
      <template v-slot:actions>
        <v-btn color="primary" variant="text" to="/cart">Ir para o Carrinho</v-btn>
      </template>
    </v-snackbar>

    <!-- Modal criar/editar (admin) -->
    <v-dialog v-model="showModal" max-width="600">
      <v-card>
        <v-card-title>{{ editingId ? 'Editar produto' : 'Novo produto' }}</v-card-title>
        <v-card-text>
          <v-form @submit.prevent="saveProduct">
            <v-file-input
              label="Imagem do produto"
              variant="outlined"
              @change="handleImageUpload"
              accept="image/*"
              class="mb-2"
            ></v-file-input>
            <v-img v-if="form.imageUrl" :src="form.imageUrl" height="150px" class="mb-2"></v-img>

            <v-text-field
              v-model="form.name"
              label="Nome"
              required
              variant="outlined"
              class="mb-2"
            ></v-text-field>
            <v-textarea
              v-model="form.description"
              label="Descrição"
              rows="2"
              variant="outlined"
              class="mb-2"
            ></v-textarea>
            <v-row>
              <v-col cols="6">
                <v-text-field
                  v-model="form.price"
                  label="Preço"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  variant="outlined"
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model.number="form.stockQuantity"
                  label="Estoque"
                  type="number"
                  min="0"
                  variant="outlined"
                ></v-text-field>
              </v-col>
            </v-row>

            <v-select
              v-model="form.categoryId"
              :items="categoryOptions"
              item-title="name"
              item-value="id"
              label="Categoria"
              variant="outlined"
              @update:model-value="onCategorySelectChange"
            ></v-select>

            <v-expand-transition>
              <div v-if="showNewCategoryFields" class="pa-3 bg-gray rounded mb-3">
                <p class="text-subtitle-2 mb-2">Nova Categoria</p>
                <v-text-field
                  v-model="newCategoryName"
                  label="Nome da categoria"
                  density="compact"
                  variant="outlined"
                  class="mb-2"
                ></v-text-field>
                <v-text-field
                  v-model="newCategoryDescription"
                  label="Descrição (opcional)"
                  density="compact"
                  variant="outlined"
                  class="mb-2"
                ></v-text-field>
                <v-btn size="small" color="secondary" @click="createCategoryAndSelect">
                  Criar e usar
                </v-btn>
              </div>
            </v-expand-transition>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="showModal = false">Cancelar</v-btn>
          <v-btn color="primary" @click="saveProduct">Salvar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useCartStore } from '~/stores/cart'
import { useApi } from '~/services/api'

const authStore = useAuthStore()
const cartStore = useCartStore()
const api = useApi()

const products = ref<any[]>([])
const categories = ref<any[]>([])
const loading = ref(true)
const search = ref('')
const categoryId = ref<string | null>(null)
const sortBy = ref<string | null>(null)
const showModal = ref(false)
const showSnackbar = ref(false)
const editingId = ref<string | null>(null)
const addedMessage = ref('')
const showNewCategoryFields = ref(false)
const newCategoryName = ref('')
const newCategoryDescription = ref('')
const form = reactive({
  name: '',
  description: '',
  price: '',
  stockQuantity: 0,
  categoryId: '',
  imageUrl: '',
})

const sortOptions = [
  { text: 'Menor Preço', value: 'price_asc' },
  { text: 'Maior Preço', value: 'price_desc' },
]

async function handleImageUpload(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  try {
    const { data } = await api.uploadImage(file)
    form.imageUrl = data.url
  } catch (error) {
    alert('Erro ao fazer upload da imagem.')
    console.error(error)
  }
}

function formatPrice(value: any) {
  if (value == null) return '0,00'
  return Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })
}

const categoryOptions = computed(() => {
  const opts = [...categories.value]
  opts.unshift({ id: '', name: 'Nenhuma' })
  opts.push({ id: '__new__', name: '+ Nova categoria' })
  return opts
})

async function loadProducts() {
  loading.value = true
  try {
    const params: any = {}
    if (categoryId.value) params.categoryId = categoryId.value
    if (search.value.trim()) params.search = search.value.trim()
    if (sortBy.value) params.sortBy = sortBy.value
    const { data } = await api.getProducts(params)
    products.value = data.map((p: any) => ({ ...p, quantityToAdd: 1 }))
  } finally {
    loading.value = false
  }
}

async function loadCategories() {
  const { data } = await api.getCategories()
  categories.value = data
}

function applyFilters() {
  loadProducts()
}

function onCategorySelectChange(selectedId: any) {
  if (selectedId === '__new__') {
    showNewCategoryFields.value = true
    setTimeout(() => {
      if (form.categoryId === '__new__') {
        form.categoryId = ''
      }
    }, 100)
  } else {
    showNewCategoryFields.value = false
  }
}

async function createCategoryAndSelect() {
  if (!newCategoryName.value.trim()) return
  try {
    const { data } = await api.createCategory({
      name: newCategoryName.value.trim(),
      description: newCategoryDescription.value.trim() || '',
    })
    categories.value.push(data)
    form.categoryId = data.id
    showNewCategoryFields.value = false
    newCategoryName.value = ''
    newCategoryDescription.value = ''
  } catch (e: any) {
    alert(e.response?.data || 'Erro ao criar categoria.')
  }
}

watch(sortBy, loadProducts)
watch(categoryId, loadProducts)

onMounted(() => {
  loadProducts()
  loadCategories()
})

function openEdit(p: any) {
  editingId.value = p.id
  form.name = p.name
  form.description = p.description || ''
  form.price = p.price
  form.stockQuantity = p.stockQuantity ?? 0
  form.categoryId = p.categoryId || ''
  form.imageUrl = p.imageUrl || ''
  showModal.value = true
}

function clearForm() {
  editingId.value = null
  form.name = ''
  form.description = ''
  form.price = ''
  form.stockQuantity = 0
  form.categoryId = ''
  form.imageUrl = ''
  showNewCategoryFields.value = false
  newCategoryName.value = ''
  newCategoryDescription.value = ''
}

function openNewProduct() {
  clearForm()
  showModal.value = true
}

async function saveProduct() {
  if (form.categoryId === '__new__') {
    alert('Crie a nova categoria com "Criar e usar" ou escolha uma categoria existente.')
    return
  }
  try {
    const payload = {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      stockQuantity: Number(form.stockQuantity) || 0,
      categoryId: form.categoryId || null,
      imageUrl: form.imageUrl,
    }
    if (editingId.value) {
      await api.updateProduct(editingId.value, payload)
    } else {
      await api.createProduct(payload)
    }
    showModal.value = false
    clearForm()
    loadProducts()
  } catch (e: any) {
    alert(e.response?.data?.message || 'Erro ao salvar.')
  }
}

async function confirmDelete(p: any) {
  if (!confirm(`Excluir "${p.name}"?`)) return
  try {
    await api.deleteProduct(p.id)
    loadProducts()
  } catch {
    alert('Erro ao excluir.')
  }
}

// Botão para adiconar ao carrinho
function addToCart(product: any) {
  const quantity = Math.max(1, product.quantityToAdd || 1)
  cartStore.addItem(product, quantity)
  addedMessage.value = `"${product.name}" (${quantity}) adicionado ao carrinho.`
  showSnackbar.value = true
}
</script>

<!-- Estilização do input de quantidade, não consegui só com o vuetify -->
<style scoped>
.quantity-input :deep(.v-field__input) {
  font-size: small;
  padding-top: 2px;
  padding-bottom: 2px;
  padding-right: 5px;
  min-height: 20px;
}
.quantity-input :deep(.v-field) {
  min-height: 20px;
}
</style>
