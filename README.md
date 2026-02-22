# Lunnar Frontend - CRM Inteligente

Este é o repositório da interface da plataforma Lunnar, um CRM Inteligente desenvolvido com Vue.js e Nuxt 3. O repositório do servidor (Spring Boot) pode ser encontrado [AQUI](https://github.com/steffaneleal/Lunnar-backend).

## Sobre o Projeto

O Lunnar Frontend fornece uma interface de usuário rica, reativa e totalmente responsiva para interagir com a API do Lunnar Backend. Ele permite que clientes naveguem pelos produtos, gerenciem seus carrinhos e pedidos, enquanto administradores possuem painéis dedicados para a gestão de produtos, clientes e categorias.

## Tecnologias Utilizadas

*   **Nuxt 3**: Framework Vue.js para aplicações universais, renderização no servidor (SSR) e geração de sites estáticos.
*   **Vue.js 3**: O framework progressivo para a construção da interface, utilizando a Composition API e `<script setup>`.
*   **Vuetify**: Biblioteca de componentes Material Design para um design elegante e responsivo.
*   **Pinia**: A solução de gerenciamento de estado oficial e intuitiva para Vue.js, utilizada para gerenciar o carrinho de compras e a sessão do usuário.
*   **TypeScript**: Para um código mais robusto, escalável e com melhor autocompletar.
*   **Axios**: Cliente HTTP para comunicação com a API RESTful do backend.
*   **Vite**: Ferramenta de build moderna que oferece uma experiência de desenvolvimento extremamente rápida.

## Funcionalidades Principais

*   **Autenticação de Usuário**: Telas de login e registro com validação de formulário em tempo real.
*   **Catálogo de Produtos Dinâmico**: Visualização de produtos com filtros por nome, categoria e ordenação por preço.
*   **Carrinho de Compras Interativo**: Adição, remoção e visualização de itens no carrinho com estado gerenciado pelo Pinia.
*   **Checkout Inteligente**: Formulário de endereço com preenchimento automático de rua, bairro, cidade e estado através da API do **ViaCEP**.
*   **Gerenciamento de Perfil e Endereços**: O cliente pode visualizar e gerenciar seus dados e múltiplos endereços de entrega.
*   **Painel de Administração**:
    *   CRUD completo para Produtos, incluindo upload de imagens.
    *   CRUD para Categorias.
    *   Visualização de Clientes (CRM) com acesso a relatórios detalhados.
    *   Visualização e gerenciamento de status de todos os pedidos.

## Como Rodar o Projeto Localmente

### Pré-requisitos

1.  Ter o **Node.js** (v18.x ou superior) instalado.
2.  Ter o **npm** ou **yarn** instalado.
3.  Ter o **Lunnar Backend** rodando localmente (geralmente em `http://localhost:8080`).

### Configuração do Ambiente

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/steffaneleal/Lunnar-frontend.git
    cd Lunnar-frontend
    ```

2.  **Variáveis de Ambiente (`.env`)**

    *   Crie um arquivo chamado `.env` na raiz do projeto.
    *   Adicione a seguinte variável, alterando a URL se o seu backend estiver rodando em uma porta diferente:

    ```dotenv
    NUXT_PUBLIC_API_BASE=http://localhost:8080
    ```

### Instalação e Execução

1.  **Instale as dependências:**
    ```bash
    npm install
    ```

2.  **Execute em modo de desenvolvimento:**
    ```bash
    npm run dev
    ```

3.  A aplicação estará disponível em `http://localhost:3000`.

## APIs Externas

O projeto utiliza a seguinte API externa para melhorar a experiência do usuário:

*   **ViaCEP**: Utilizada para o preenchimento automático de endereços a partir do CEP no formulário de checkout e de adição de endereço. Agradecimentos à equipe do ViaCEP por fornecer este serviço público de alta qualidade.
    *   **URL**: `https://viacep.com.br`
