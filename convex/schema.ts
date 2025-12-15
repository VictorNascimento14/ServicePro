import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // 1. Tabela de Profissionais/Usuários
  usersProfessionals: defineTable({
    ownerId: v.optional(v.string()),
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    photoUrl: v.optional(v.string()),
    role: v.string(), // e.g., "Senior Stylist", "Barber"
    calendarColor: v.string(), // Hex color
    status: v.union(v.literal("active"), v.literal("inactive")),
    notificationSettings: v.any(), // JSON object
    createdAt: v.number(), // Convex uses numbers for dates (timestamps)
    updatedAt: v.number(),
    deletedAt: v.optional(v.number()),
  })
    .index("ownerId_email", ["ownerId", "email"])
    .index("ownerId_status", ["ownerId", "status"]),

  // 2. Tabela de Clientes
  customers: defineTable({
    ownerId: v.optional(v.string()),
    fullName: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    photoUrl: v.optional(v.string()),
    birthDate: v.optional(v.string()), // ISO date string
    addressCity: v.optional(v.string()),
    addressState: v.optional(v.string()),
    registeredAt: v.number(),
    status: v.union(v.literal("active"), v.literal("inactive")),
    tags: v.array(v.string()), // Array of tags
    preferences: v.optional(v.string()),
    allergies: v.optional(v.string()),
    avgRating: v.number(), // 0.00 to 5.00
    totalVisits: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
    deletedAt: v.optional(v.number()),
  })
    .index("ownerId_email", ["ownerId", "email"])
    .index("ownerId_status", ["ownerId", "status"])
    .index("ownerId_tags", ["ownerId", "tags"]),

  // 3. Tabela de Serviços
  services: defineTable({
    ownerId: v.optional(v.string()),
    name: v.string(),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
    durationMinutes: v.number(), // > 0
    price: v.number(), // >= 0
    status: v.union(v.literal("active"), v.literal("inactive")),
    iconUrl: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
    deletedAt: v.optional(v.number()),
  })
    .index("ownerId_category", ["ownerId", "category"])
    .index("ownerId_status", ["ownerId", "status"]),

  // 4. Tabela de Agendamentos
  appointments: defineTable({
    ownerId: v.string(),
    professionalClerkId: v.string(), // clerkId do profissional
    clientClerkId: v.string(), // clerkId do cliente
    clientName: v.string(),
    clientEmail: v.optional(v.string()),
    clientPhone: v.optional(v.string()),
    serviceId: v.id("services"),
    date: v.string(), // formato DD/MM/YYYY
    time: v.string(), // formato HH:MM
    dayOfWeek: v.string(), // 'Domingo', 'Segunda', etc.
    totalValue: v.number(),
    status: v.union(
      v.literal("confirmed"),
      v.literal("pending"),
      v.literal("cancelled"),
      v.literal("completed")
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("ownerId", ["ownerId"])
    .index("professionalClerkId", ["professionalClerkId"])
    .index("clientClerkId", ["clientClerkId"])
    .index("ownerId_status", ["ownerId", "status"]),

  // 5. Tabela de Bloqueios de Horário
  timeBlocks: defineTable({
    ownerId: v.string(),
    professionalId: v.id("usersProfessionals"),
    startDatetime: v.number(),
    endDatetime: v.number(),
    reason: v.optional(v.string()),
    type: v.union(
      v.literal("unavailable"),
      v.literal("vacation"),
      v.literal("lunch")
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("ownerId_professionalId", ["ownerId", "professionalId"])
    .index("ownerId_startDatetime", ["ownerId", "startDatetime"])
    .index("ownerId_endDatetime", ["ownerId", "endDatetime"]),

  // 6. Tabela de Solicitações de Agendamento
  appointmentRequests: defineTable({
    ownerId: v.string(),
    customerId: v.id("customers"),
    serviceId: v.id("services"),
    requestedDatetime: v.number(),
    status: v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("rejected")
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("ownerId_customerId", ["ownerId", "customerId"])
    .index("ownerId_serviceId", ["ownerId", "serviceId"])
    .index("ownerId_status", ["ownerId", "status"])
    .index("ownerId_requestedDatetime", ["ownerId", "requestedDatetime"]),

  // 7. Tabela de Histórico de Atendimentos
  serviceHistory: defineTable({
    ownerId: v.string(),
    appointmentId: v.id("appointments"),
    serviceDate: v.string(), // ISO date string
    customerRating: v.optional(v.number()), // 1-5
    comments: v.optional(v.string()),
    amountPaid: v.number(), // >= 0
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("ownerId_appointmentId", ["ownerId", "appointmentId"])
    .index("ownerId_serviceDate", ["ownerId", "serviceDate"]),

  // 8. Tabela de Junção Profissionais-Serviços (N:N)
  professionalServices: defineTable({
    ownerId: v.optional(v.string()),
    professionalId: v.id("usersProfessionals"),
    serviceId: v.id("services"),
    createdAt: v.number(),
  })
    .index("ownerId_professionalId", ["ownerId", "professionalId"])
    .index("ownerId_serviceId", ["ownerId", "serviceId"]),

  // 9. Tabela de Configurações do Negócio
  businessSettings: defineTable({
    ownerId: v.optional(v.string()),
    businessName: v.string(),
    logoUrl: v.optional(v.string()),
    address: v.optional(v.string()),
    phone: v.optional(v.string()),
    openingHours: v.any(), // JSON object
    timezone: v.string(),
    notificationSettings: v.any(), // JSON object
    financialMetrics: v.any(), // JSON object with metrics
    createdAt: v.number(),
    updatedAt: v.number(),
  }),

  // 10. Tabela de Templates de Notificação
  notificationTemplates: defineTable({
    ownerId: v.string(),
    name: v.string(),
    type: v.union(
      v.literal("confirmation"),
      v.literal("reminder"),
      v.literal("cancellation")
    ),
    content: v.string(),
    active: v.boolean(),
    professionalId: v.optional(v.id("usersProfessionals")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("ownerId_type", ["ownerId", "type"])
    .index("ownerId_active", ["ownerId", "active"])
    .index("ownerId_professionalId", ["ownerId", "professionalId"]),

  // 11. Tabela de Perfis de Usuário (Clerk Integration)
  userProfiles: defineTable({
    clerkId: v.string(),
    userName: v.optional(v.string()), // Nome que o usuário quer ser chamado
    userType: v.string(), // 'barber', 'business', 'client'
    businessName: v.optional(v.string()),
    services: v.array(v.string()), // Array of service types
    experience: v.optional(v.string()), // 'beginner', 'intermediate', 'experienced', 'expert'
    location: v.optional(v.string()), // Cidade
    neighborhood: v.optional(v.string()), // Bairro
    address: v.optional(v.string()), // Endereço completo
    phone: v.optional(v.string()),
    preferences: v.array(v.string()), // Array of style preferences
    availability: v.optional(v.string()), // Availability preferences
    onboardingCompleted: v.boolean(),
    linkedToOwnerId: v.optional(v.string()), // Para funcionários: ID do dono da barbearia
    isOwner: v.optional(v.boolean()), // true para donos de estabelecimento
    autoApproveClients: v.optional(v.boolean()), // Se true, agendamentos de clientes são aprovados automaticamente
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("linkedToOwnerId", ["linkedToOwnerId"]),

  // 12. Tabela de Solicitações de Vínculo (Funcionários → Barbearias)
  linkRequests: defineTable({
    employeeId: v.string(), // clerkId do funcionário
    ownerId: v.string(), // clerkId do dono da barbearia
    employeeName: v.string(),
    employeePhone: v.optional(v.string()),
    employeeExperience: v.optional(v.string()),
    employeeServices: v.array(v.string()),
    status: v.string(), // 'pending', 'accepted', 'rejected'
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("ownerId_status", ["ownerId", "status"])
    .index("employeeId", ["employeeId"]),

  // 13. Tabela de Disponibilidade de Horários
  availability: defineTable({
    ownerId: v.string(),
    dayOfWeek: v.string(), // 'Domingo', 'Segunda', etc.
    hour: v.string(), // '08:00', '09:00', etc.
    isAvailable: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("ownerId_day", ["ownerId", "dayOfWeek"])
    .index("ownerId", ["ownerId"]),

  // 14. Tabela de Notificações
  notifications: defineTable({
    recipientClerkId: v.string(), // quem vai receber a notificação
    type: v.union(
      v.literal("new_appointment"),
      v.literal("cancelled_appointment"),
      v.literal("appointment_reminder")
    ),
    title: v.string(),
    message: v.string(),
    appointmentId: v.optional(v.id("appointments")),
    data: v.optional(v.any()), // dados adicionais em JSON
    isRead: v.boolean(),
    createdAt: v.number(),
  })
    .index("recipientClerkId", ["recipientClerkId"])
    .index("recipientClerkId_isRead", ["recipientClerkId", "isRead"]),
});