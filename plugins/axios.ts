import axios from 'axios'
import {defineNuxtPlugin, useRuntimeConfig} from "nuxt/app";

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  const baseURL = config.public.apiBase

  const api = axios.create({
    baseURL,
    headers: { 'Content-Type': 'application/json' },
  })

  // Só adiciona interceptors no client (localStorage não existe no SSR)
  if (import.meta.client) {
    api.interceptors.request.use((cfg) => {
      const token = localStorage.getItem('token')
      if (token) {
        cfg.headers.Authorization = `Bearer ${token}`
      }
      return cfg
    })

    api.interceptors.response.use(
      (response) => response,
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

  nuxtApp.provide('api', api)
})
