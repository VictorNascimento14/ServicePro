# ServicePro Dashboard

Dashboard moderno e responsivo para gerenciamento de serviços, desenvolvido com React, Tailwind CSS, Clerk e Convex.

## 🚀 Tecnologias

- **React 18** - Biblioteca JavaScript para interfaces
- **Vite** - Build tool e dev server
- **Tailwind CSS** - Framework CSS utilitário
- **React Router** - Roteamento
- **Clerk** - Autenticação (a configurar)
- **Convex** - Banco de dados em tempo real (a configurar)

## 📦 Instalação

1. Instale as dependências:
```bash
npm install
```

2. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

Edite o arquivo `.env` e adicione:
```
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_CONVEX_URL=https://...
```

## 🔧 Configuração

### Clerk (Autenticação)

1. Crie uma conta em [Clerk](https://clerk.com)
2. Crie um novo aplicativo
3. Copie a chave pública (Publishable Key)
4. Adicione no arquivo `.env`:
   ```
   VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
   ```
5. Descomente o código em `src/lib/clerk.js` e `src/App.jsx`

### Convex (Banco de Dados)

1. Instale o Convex CLI:
```bash
npm install -g convex
```

2. Faça login no Convex:
```bash
npx convex login
```

3. Inicialize o projeto Convex:
```bash
npx convex init
```

4. Execute as migrações do schema:
```bash
npx convex deploy
```

5. Popule o banco com dados iniciais:
```bash
npx convex run seed:seedDatabase
```

6. Copie a URL do deployment e adicione no `.env`:
```
VITE_CONVEX_URL=https://your-deployment.convex.cloud
```

## 🗄️ Schema do Banco de Dados

O projeto inclui um schema completo para sistema de agendamento com:

- **Profissionais**: Cadastro de barbeiros/cabeleireiros
- **Clientes**: Base de clientes com tags e preferências
- **Serviços**: Catálogo de serviços oferecidos
- **Agendamentos**: Sistema completo de reservas
- **Bloqueios**: Controle de indisponibilidades
- **Histórico**: Registro de atendimentos realizados
- **Configurações**: Dados do negócio e métricas

### Funcionalidades Implementadas

- ✅ Validações de conflito de horário
- ✅ Relacionamentos N:N entre profissionais e serviços
- ✅ Soft deletes para dados sensíveis
- ✅ Índices otimizados para consultas por data
- ✅ Sistema de notificações configurável
- ✅ Métricas financeiras agregadas

## 🏃 Executar o Projeto

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview
```

## 📁 Estrutura do Projeto

```
src/
├── components/     # Componentes reutilizáveis
├── pages/          # Páginas da aplicação
├── layouts/        # Layouts (DashboardLayout, etc)
├── hooks/          # Custom hooks
├── lib/            # Configurações (Clerk, Convex)
└── styles/         # Estilos globais
```

## 🎨 Páginas

- **Dashboard** (`/`) - Visão geral e estatísticas
- **Agenda** (`/agenda`) - Calendário de agendamentos
- **Clientes** (`/clientes`) - Lista de clientes
- **Cliente Detalhes** (`/clientes/:id`) - Detalhes do cliente
- **Serviços** (`/servicos`) - Gerenciamento de serviços
- **Financeiro** (`/financeiro`) - Relatórios financeiros
- **Configurações** (`/configuracoes`) - Configurações do sistema

## 🔐 Autenticação

O projeto está preparado para usar Clerk. Para ativar:

1. Configure as variáveis de ambiente
2. Descomente o código em `src/lib/clerk.js`
3. Descomente o `ClerkProvider` em `src/App.jsx`
4. Use os hooks do Clerk nos componentes:
   ```jsx
   import { useUser } from '@clerk/clerk-react'
   
   function MyComponent() {
     const { user } = useUser()
     // ...
   }
   ```

## 💾 Banco de Dados

O projeto está preparado para usar Convex. Para ativar:

1. Execute `npx convex dev`
2. Descomente o código em `src/lib/convex.js`
3. Use o cliente Convex nos componentes:
   ```jsx
   import { useQuery } from 'convex/react'
   import { api } from '../convex/_generated/api'
   
   function MyComponent() {
     const data = useQuery(api.myFunction)
     // ...
   }
   ```

## 📝 Próximos Passos

1. Configure Clerk e Convex
2. Crie os schemas no Convex
3. Implemente as funcionalidades de cada página
4. Adicione validações e tratamento de erros
5. Implemente testes

## 📄 Licença

Este projeto é de código aberto.

