# Lunnar Frontend - CRM Inteligente

Este é o repositório da interface da plataforma Lunnar, um CRM Inteligente desenvolvido com Vue.js e Nuxt 3. O repositório do servidor (Spring Boot) pode ser encontrado [AQUI](https://github.com/steffaneleal/Lunnar-backend).

## Sobre o Projeto

O Lunnar Frontend fornece uma interface de usuário rica, reativa e totalmente responsiva para interagir com a API do Lunnar Backend. Ele permite que clientes naveguem pelos produtos e gerenciem seus pedidos, enquanto administradores possuem um painel de controle estratégico com KPIs (Key Performance Indicator - Indicador-Chave de Desempenho), gráficos e ferramentas avançadas para a gestão de produtos, clientes e categorias.

## Tecnologias Utilizadas

*   **Nuxt 3**: Framework Vue.js para aplicações universais e de página única (SPA).
*   **Vue.js 3**: O framework progressivo para a construção da interface, utilizando a Composition API e `<script setup>`.
*   **Vuetify**: Biblioteca de componentes Material Design para um design elegante e responsivo.
*   **Pinia**: A solução de gerenciamento de estado oficial e intuitiva para Vue.js, utilizada para gerenciar o carrinho de compras e a sessão do usuário.
*   **TypeScript**: Para um código mais robusto, escalável e com melhor autocompletar.
*   **Axios**: Cliente HTTP para comunicação com a API RESTful do backend.
*   **Vite**: Ferramenta de build moderna que oferece uma experiência de desenvolvimento extremamente rápida.
*   **Chart.js & vue-chartjs**: Para a renderização de gráficos dinâmicos no dashboard.
*   **SweetAlert2**: Para a criação de alertas e modais de confirmação elegantes e customizáveis.

## Funcionalidades Principais

### Painel de Administração
*   **Dashboard Estratégico**: Visualização de KPIs essenciais como Receita Total, Ticket Médio, Total de Pedidos e Clientes Ativos.
*   **Gráficos Dinâmicos**: Análise visual da Receita por Região (gráfico de pizza) e Distribuição de Pedidos por Status.
*   **CRM Avançado**: Gestão de clientes com acesso a relatórios individuais detalhados, incluindo histórico de compras, total gasto e tendências de comportamento.
*   **Promoção de Usuários**: Capacidade de promover usuários comuns a administradores diretamente pela interface.
*   **Gestão de Produtos e Categorias**: CRUD completo para produtos e categorias, com upload de imagens e validação de formulários.
*   **Gestão de Pedidos**: Filtro de pedidos por status e capacidade de alterar o status de cada pedido.

### Experiência do Cliente
*   **Catálogo de Produtos Dinâmico**: Visualização de produtos com filtros por nome, categoria e ordenação por preço.
*   **Validação em Tempo Real**: Campos de quantidade com validação de estoque e máscaras para campos de telefone e preço, melhorando a experiência de preenchimento.
*   **Checkout Inteligente**: Formulário de endereço com preenchimento automático via API do **ViaCEP**.
*   **Gerenciamento de Perfil e Endereços**: O cliente pode visualizar, adicionar e remover múltiplos endereços de entrega, além de editar seus dados de perfil.
*   **Cancelamento de Pedidos (Self-service)**: O cliente pode cancelar seus próprios pedidos enquanto o status ainda estiver "PENDENTE".

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

*   **ViaCEP**: Utilizada para o preenchimento automático de endereços a partir do CEP. Agradecimentos à equipe do ViaCEP por fornecer este serviço público de alta qualidade.
    *   **URL**: `https://viacep.com.br`
