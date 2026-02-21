// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: false },

  // SPA mode: desabilita SSR para evitar flash de autenticação
  // (o app usa localStorage e não tem benefício real de SSR)
  ssr: false,

  modules: ['@pinia/nuxt'],

  css: [
    'vuetify/styles',
    '@mdi/font/css/materialdesignicons.css',
  ],

  build: {
    transpile: ['vuetify'],
  },

  vite: {
    define: {
      'process.env.DEBUG': false,
    },
    ssr: {
      noExternal: ['vuetify'],
    },
  },

  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:8080',
    },
  },

  // Servidor de desenvolvimento com proxy para a API
  nitro: {
    devProxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path: string) => path.replace(/^\/api/, ''),
      },
    },
  },

  app: {
    head: {
      title: 'Lunnar',
      titleTemplate: '%s',
      link: [
        { rel: 'icon', type: 'image/png', href: '/lunnar-icon.png' }
      ]
    }
  }
})