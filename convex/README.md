# Convex Functions

Esta pasta será criada automaticamente quando você executar `npx convex dev`.

## Estrutura sugerida:

```
convex/
├── _generated/          # Arquivos gerados automaticamente
├── schema.js            # Schema do banco de dados
├── clients.js           # Queries e mutations para clientes
├── appointments.js      # Queries e mutations para agendamentos
├── services.js          # Queries e mutations para serviços
└── financial.js         # Queries e mutations para dados financeiros
```

## Exemplo de schema:

```javascript
// convex/schema.js
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  clients: defineTable({
    name: v.string(),
    email: v.string(),
    phone: v.string(),
    createdAt: v.number(),
  }),
  
  appointments: defineTable({
    clientId: v.id("clients"),
    serviceId: v.id("services"),
    date: v.number(),
    time: v.string(),
    status: v.string(),
  }),
  
  services: defineTable({
    name: v.string(),
    price: v.number(),
    duration: v.number(),
    active: v.boolean(),
  }),
});
```

