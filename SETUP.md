# Guia de Configuração - ServicePro Dashboard

Este guia irá ajudá-lo a configurar o Clerk e o Convex no projeto.

## 📋 Pré-requisitos

- Node.js 18+ instalado
- Conta no [Clerk](https://clerk.com) (gratuita)
- Conta no [Convex](https://convex.dev) (gratuita)

## 🔐 Passo 1: Configurar Clerk (Autenticação)

### 1.1 Criar conta no Clerk

1. Acesse https://clerk.com
2. Crie uma conta gratuita
3. Crie um novo aplicativo
4. Escolha "Email" como método de autenticação (ou outros de sua preferência)

### 1.2 Obter a chave pública

1. No dashboard do Clerk, vá em **API Keys**
2. Copie a **Publishable Key** (começa com `pk_test_...` ou `pk_live_...`)

### 1.3 Configurar no projeto

1. Crie um arquivo `.env` na raiz do projeto:
```bash
cp .env.example .env
```

2. Adicione a chave no arquivo `.env`:
```
VITE_CLERK_PUBLISHABLE_KEY=pk_test_sua_chave_aqui
```

### 1.4 Ativar Clerk no código

1. Edite `src/lib/clerk.js` e descomente o código
2. Edite `src/App.jsx` e descomente as linhas do ClerkProvider

### 1.5 Usar autenticação nos componentes

```jsx
import { useUser } from '@clerk/clerk-react'

function MyComponent() {
  const { user, isLoaded } = useUser()
  
  if (!isLoaded) return <div>Carregando...</div>
  if (!user) return <div>Faça login</div>
  
  return <div>Olá, {user.firstName}!</div>
}
```

## 💾 Passo 2: Configurar Convex (Banco de Dados)

### 2.1 Instalar Convex CLI

```bash
npm install -g convex
```

### 2.2 Fazer login no Convex

```bash
npx convex login
```

### 2.3 Inicializar Convex no projeto

```bash
npx convex init
```

Quando perguntado se já existe uma pasta convex/, responda **"yes"**.

### 2.4 Deploy do schema

```bash
# Deploy das tabelas e funções para o Convex
npx convex deploy
```

### 2.5 Popular banco com dados iniciais

```bash
# Executar função de seed para criar dados de exemplo
npx convex run seed:seedDatabase
```

### 2.6 Verificar configuração

```bash
# Verificar se o .env tem a URL correta
npm run dev
```

### 2.7 Schema já implementado

O projeto já inclui um schema completo com 10 tabelas:

- `usersProfessionals` - Profissionais da barbearia
- `customers` - Clientes
- `services` - Serviços oferecidos
- `appointments` - Agendamentos
- `timeBlocks` - Bloqueios de horário
- `appointmentRequests` - Solicitações de agendamento
- `serviceHistory` - Histórico de atendimentos
- `professionalServices` - Relacionamento N:N profissionais↔serviços
- `businessSettings` - Configurações do negócio
- `notificationTemplates` - Templates de notificação

### 2.8 Usando Convex no código

```jsx
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

// Buscar profissionais ativos
const professionals = useQuery(api.users.getActiveProfessionals);

// Criar agendamento
const createAppointment = useMutation(api.appointments.create);

await createAppointment({
  startDatetime: Date.now(),
  endDatetime: Date.now() + 3600000, // +1 hora
  customerId: "...",
  professionalId: "...",
  serviceId: "...",
  totalValue: 50.00
});
```
    clientId: v.id("clients"),
    serviceId: v.id("services"),
    date: v.number(),
    time: v.string(),
    status: v.string(), // "pending", "confirmed", "completed", "cancelled"
    userId: v.string(),
  }),
  
  services: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    price: v.number(),
    duration: v.number(), // em minutos
    active: v.boolean(),
    userId: v.string(),
  }),
});
```

### 2.5 Criar queries e mutations

Exemplo: `convex/clients.js`

```javascript
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("clients").collect();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    
    return await ctx.db.insert("clients", {
      ...args,
      userId: identity.subject,
      createdAt: Date.now(),
    });
  },
});
```

### 2.6 Ativar Convex no código

1. Edite `src/lib/convex.js` e descomente o código
2. Use nos componentes:

```jsx
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

function ClientsList() {
  const clients = useQuery(api.clients.list);
  const createClient = useMutation(api.clients.create);
  
  if (clients === undefined) return <div>Carregando...</div>;
  
  return (
    <div>
      {clients.map(client => (
        <div key={client._id}>{client.name}</div>
      ))}
    </div>
  );
}
```

## 🚀 Passo 3: Executar o projeto

```bash
# Terminal 1: Convex (deixe rodando)
npx convex dev

# Terminal 2: Vite
npm run dev
```

## ✅ Verificação

1. **Clerk**: Você deve ver a tela de login ao acessar a aplicação
2. **Convex**: O dashboard do Convex deve estar acessível e mostrando suas tabelas

## 📚 Recursos

- [Documentação Clerk](https://clerk.com/docs)
- [Documentação Convex](https://docs.convex.dev)
- [React Router](https://reactrouter.com)

## 🆘 Problemas Comuns

### Clerk não funciona
- Verifique se a chave está correta no `.env`
- Certifique-se de que descomentou o código em `src/App.jsx`
- Verifique o console do navegador para erros

### Convex não conecta
- Execute `npx convex dev` primeiro
- Verifique se `VITE_CONVEX_URL` está no `.env`
- Certifique-se de que descomentou o código em `src/lib/convex.js`

### Erro de CORS
- Verifique se o domínio está configurado no Clerk
- No Convex, verifique as configurações de CORS

