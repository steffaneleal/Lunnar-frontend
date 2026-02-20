# Lunnar-frontend
Esta é a interface da plataforma Lunnar, CRM Inteligente desenvolvido durante a terceira fase do processo seletivo para a Astrocode, utilizando Vue.js. Ela consome a API Spring Boot disponível [AQUI](https://github.com/steffaneleal/Lunnar-backend).

## Stack
- Nuxt 3
- Vuetify 3
- Pinia (`@pinia/nuxt`)
- Axios
- TypeScript

## Instalação

```bash
npm install
```

## Desenvolvimento

```bash
npm run dev
```

O servidor sobe em `http://localhost:3000`.

A variável de ambiente `NUXT_PUBLIC_API_BASE` define a URL da API. Copie o arquivo `.env.example` para `.env` e ajuste conforme necessário:

```bash
cp .env.example .env
```
