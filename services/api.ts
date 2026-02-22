import axios from 'axios'
import type { AxiosInstance } from 'axios'

// Singleton: criado uma única vez, interceptors registrados apenas uma vez
let _api: AxiosInstance | null = null
let _interceptorsRegistered = false

function createApi(baseURL: string): AxiosInstance {
  const instance = axios.create({
    baseURL,
    headers: { 'Content-Type': 'application/json' },
  })

  if (import.meta.client && !_interceptorsRegistered) {
    _interceptorsRegistered = true

    instance.interceptors.request.use((cfg) => {
      const token = localStorage.getItem('token')
      if (token) cfg.headers.Authorization = `Bearer ${token}`
      return cfg
    })

    instance.interceptors.response.use(
        (res) => res,
        (error) => {
          if (error.response?.status === 401) {
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            navigateTo('/login')
          }
          return Promise.reject(error)
        }
    )
  }

  return instance
}

// Composable para usar dentro de setup()
export function useApi() {
  if (!_api) {
    const config = useRuntimeConfig()
    _api = createApi(config.public.apiBase)
  }

  return {
    // Auth
    login: (email: string, password: string) => _api!.post('/auth/login', { email, password }),
    register: (data: object) => _api!.post('/auth/register', data),
    getMe: () => _api!.get('/auth/me'),

    // Upload
    uploadImage: (file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      const token = localStorage.getItem('token')
      return _api!.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': token ? `Bearer ${token}` : '',
        },
      })
    },

    // Categorias
    getCategories: () => _api!.get('/categories'),
    getCategory: (id: string) => _api!.get(`/categories/${id}`),
    createCategory: (data: object) => _api!.post('/categories', data),
    updateCategory: (id: string, data: object) => _api!.put(`/categories/${id}`, data),
    deleteCategory: (id: string) => _api!.delete(`/categories/${id}`),

    // Produtos
    getProducts: (params = {}) => _api!.get('/products', { params }),
    getProduct: (id: string) => _api!.get(`/products/${id}`),
    createProduct: (data: object) => _api!.post('/products', data),
    updateProduct: (id: string, data: object) => _api!.put(`/products/${id}`, data),
    updateProductStock: (id: string, stockQuantity: number) =>
        _api!.patch(`/products/${id}/stock`, { stockQuantity }),
    deleteProduct: (id: string) => _api!.delete(`/products/${id}`),

    // Pedidos
    getOrders: () => _api!.get('/orders'),
    getOrder: (id: string) => _api!.get(`/orders/${id}`),
    createOrder: (orderData: object) => _api!.post('/orders', orderData),
    updateOrderStatus: (id: string, status: string) =>
        _api!.patch(`/orders/${id}/status`, { status }),
    cancelOrder: (id: string) => _api!.delete(`/orders/${id}`),

    // Usuário logado
    updateMe: (data: object) => _api!.put('/users/me', data),

    // Usuários e Endereços
    getCustomers: () => _api!.get('/customers'),
    getCustomer: (id: string) => _api!.get(`/customers/${id}`),
    getMyProfile: () => _api!.get('/customers/me'),
    updateMyProfile: (data: object) => _api!.put('/customers/me', data),
    updateCustomer: (id: string, data: object) => _api!.put(`/customers/${id}`, data),
    getCustomerReport: (customerId: string) => _api!.get(`/customers/${customerId}/report`),
    getMyAddresses: () => _api!.get('/customers/me/addresses'),
    addMyAddress: (data: object) => _api!.post('/customers/me/addresses', data),
    deleteMyAddress: (id: string) => _api!.delete(`/customers/me/addresses/${id}`),
  }
}
