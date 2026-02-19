import axios from "axios";
import { error } from "console";
import { defineNuxtPlugin, useRuntimeConfig } from "nuxt/app";

export default defineNuxtPlugin((nuxtApp) => {
   const config = useRuntimeConfig();
   const baseURL = config.public.apiBase

   const api = axios.create({
      baseURL,
      headers: {
         "Content-Type": "application/json",
      },
   })

   if (import.meta.client) {
        api.interceptors.request.use((cfg) => {
            const token = localStorage.getItem("token")
            if (token) {
                cfg.headers.Authorization = `Bearer ${token}`
            }
            return cfg
        })

        api.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response?.status === 401) {
                    localStorage.removeItem("token")
                    localStorage.removeItem("user")
                    window.location.href = "/login"
                }
            }
        )
    }  

    nuxtApp.provide("api", api)
});