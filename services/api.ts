import axios from 'axios'
import type { AxiosInstance } from 'axios'

// Cria instância axios reutilizável para o lado cliente
let _api: AxiosInstance | null = null

function getApi(): AxiosInstance {
  if (_api) return _api

  const baseURL =
    typeof window !== 'undefined'
      ? (window.__NUXT__?.config?.public?.apiBase ?? 'http://localhost:8080')
      : 'http://localhost:8080'

  _api = axios.create({
    baseURL,
    headers: { 'Content-Type': 'application/json' },
  })

  if (typeof window !== 'undefined') {
    _api.interceptors.request.use((config) => {
      const token = localStorage.getItem('token')
      if (token) config.headers.Authorization = `Bearer ${token}`
      return config
    })

    _api.interceptors.response.use(
      (res) => res,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          window.location.href = '/login'
        }
        return Promise.reject(error)
      }
    )
  }

  return _api
}

// Composable para usar dentro de setup()
export function useApi() {
  const config = useRuntimeConfig()
  const baseURL = config.public.apiBase

  if (!_api) {
    _api = axios.create({
      baseURL,
      headers: { 'Content-Type': 'application/json' },
    })

    if (import.meta.client) {
      _api.interceptors.request.use((cfg) => {
        const token = localStorage.getItem('token')
        if (token) cfg.headers.Authorization = `Bearer ${token}`
        return cfg
      })

      _api.interceptors.response.use(
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
  }

  return {
    // Auth
    login: (email: string, password: string) => _api!.post('/auth/login', { email, password }),
    register: (data: object) => _api!.post('/auth/register', data),
    getMe: () => _api!.get('/auth/me'),

    // Categories
    getCategories: () => _api!.get('/categories'),
    getCategory: (id: string) => _api!.get(`/categories/${id}`),
    createCategory: (data: object) => _api!.post('/categories', data),
    updateCategory: (id: string, data: object) => _api!.put(`/categories/${id}`, data),
    deleteCategory: (id: string) => _api!.delete(`/categories/${id}`),

    // Products
    getProducts: (params = {}) => _api!.get('/products', { params }),
    getProduct: (id: string) => _api!.get(`/products/${id}`),
    createProduct: (data: object) => _api!.post('/products', data),
    updateProduct: (id: string, data: object) => _api!.put(`/products/${id}`, data),
    updateProductStock: (id: string, stockQuantity: number) =>
      _api!.patch(`/products/${id}/stock`, { stockQuantity }),
    deleteProduct: (id: string) => _api!.delete(`/products/${id}`),

    // Orders
    getOrders: () => _api!.get('/orders'),
    getOrder: (id: string) => _api!.get(`/orders/${id}`),
    createOrder: (items: object[]) => _api!.post('/orders', { items }),
    updateOrderStatus: (id: string, status: string) =>
      _api!.patch(`/orders/${id}/status`, { status }),

    // Customers
    getCustomers: () => _api!.get('/customers'),
    getCustomer: (id: string) => _api!.get(`/customers/${id}`),
    getMyProfile: () => _api!.get('/customers/me'),
    updateCustomer: (id: string, data: object) => _api!.put(`/customers/${id}`, data),
    getCustomerReport: (customerId: string) => _api!.get(`/customers/${customerId}/report`),
  }
}
