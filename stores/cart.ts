import { defineStore } from 'pinia'

interface Product {
  id: number
  name: string
  price: number
  quantity: number
  stockQuantity: number // Adicionando estoque para validação
}

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [] as Product[],
  }),

  getters: {
    itemCount: (state) => {
      return state.items.reduce((total, item) => total + item.quantity, 0)
    },
    totalPrice: (state) => {
      return state.items.reduce((total, item) => total + item.price * item.quantity, 0)
    },
  },

  actions: {
    addItem(product: Product, quantity = 1) {
      const existingItem = this.items.find((item) => item.id === product.id)

      if (existingItem) {
        existingItem.quantity += quantity
      } else {
        this.items.push({ ...product, quantity })
      }
    },

    removeItem(productId: number) {
      const index = this.items.findIndex((item) => item.id === productId)
      if (index !== -1) {
        this.items.splice(index, 1)
      }
    },

    updateQuantity(productId: number, newQuantity: number) {
      const item = this.items.find((item) => item.id === productId)
      if (item) {
        // Garante que a nova quantidade não exceda o estoque e não seja menor que 1
        const validatedQuantity = Math.max(1, Math.min(newQuantity, item.stockQuantity));
        item.quantity = validatedQuantity
      }
    },

    clearCart() {
      this.items = []
    },
  },
})
