import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// SERVIÇOS

// Buscar todos os serviços ativos
export const getActiveServices = query({
  args: { ownerId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("services")
      .withIndex("ownerId_status", (q) => q.eq("ownerId", args.ownerId).eq("status", "active"))
      .collect();
  },
});

// Buscar serviços por categoria
export const getServicesByCategory = query({
  args: {
    ownerId: v.string(),
    category: v.union(
      v.literal("Hair"),
      v.literal("Beard"),
      v.literal("Combo"),
      v.literal("Coloring")
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("services")
      .withIndex("ownerId_category", (q) => q.eq("ownerId", args.ownerId).eq("category", args.category))
      .collect();
  },
});

// Buscar serviço por ID
export const getServiceById = query({
  args: { id: v.id("services"), ownerId: v.string() },
  handler: async (ctx, args) => {
    const service = await ctx.db.get(args.id);
    if (!service || service.ownerId !== args.ownerId) {
      throw new Error("Serviço não encontrado ou não pertence ao owner");
    }
    return service;
  },
});

// Criar novo serviço
export const createService = mutation({
  args: {
    ownerId: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    category: v.union(
      v.literal("Hair"),
      v.literal("Beard"),
      v.literal("Combo"),
      v.literal("Coloring")
    ),
    durationMinutes: v.number(),
    price: v.number(),
    iconUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    return await ctx.db.insert("services", {
      ownerId: args.ownerId,
      name: args.name,
      description: args.description,
      category: args.category,
      durationMinutes: args.durationMinutes,
      price: args.price,
      status: "active",
      iconUrl: args.iconUrl,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Atualizar serviço
export const updateService = mutation({
  args: {
    id: v.id("services"),
    ownerId: v.string(),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    category: v.optional(v.union(
      v.literal("Hair"),
      v.literal("Beard"),
      v.literal("Combo"),
      v.literal("Coloring")
    )),
    durationMinutes: v.optional(v.number()),
    price: v.optional(v.number()),
    iconUrl: v.optional(v.string()),
    status: v.optional(v.union(v.literal("active"), v.literal("inactive"))),
  },
  handler: async (ctx, args) => {
    const service = await ctx.db.get(args.id);
    if (!service || service.ownerId !== args.ownerId) {
      throw new Error("Serviço não encontrado ou não pertence ao owner");
    }

    await ctx.db.patch(args.id, {
      ...args,
      updatedAt: Date.now(),
    });

    return args.id;
  },
});

// Deletar serviço (soft delete)
export const deleteService = mutation({
  args: { id: v.id("services"), ownerId: v.string() },
  handler: async (ctx, args) => {
    const service = await ctx.db.get(args.id);
    if (!service || service.ownerId !== args.ownerId) {
      throw new Error("Serviço não encontrado ou não pertence ao owner");
    }

    await ctx.db.patch(args.id, {
      status: "inactive",
      deletedAt: Date.now(),
      updatedAt: Date.now(),
    });

    return args.id;
  },
});

// CONFIGURAÇÕES DO NEGÓCIO

// Buscar configurações
export const getBusinessSettings = query({
  args: { ownerId: v.string() },
  handler: async (ctx, args) => {
    const settings = await ctx.db
      .query("businessSettings")
      .filter((q) => q.eq(q.field("ownerId"), args.ownerId))
      .first();
    return settings;
  },
});

// Criar/atualizar configurações do negócio
export const upsertBusinessSettings = mutation({
  args: {
    ownerId: v.string(),
    businessName: v.string(),
    logoUrl: v.optional(v.string()),
    address: v.optional(v.string()),
    phone: v.optional(v.string()),
    openingHours: v.any(),
    timezone: v.optional(v.string()),
    notificationSettings: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("businessSettings")
      .filter((q) => q.eq(q.field("ownerId"), args.ownerId))
      .first();

    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, {
        businessName: args.businessName,
        logoUrl: args.logoUrl,
        address: args.address,
        phone: args.phone,
        openingHours: args.openingHours,
        timezone: args.timezone || "America/Sao_Paulo",
        notificationSettings: args.notificationSettings || {},
        updatedAt: now,
      });
      return existing._id;
    } else {
      return await ctx.db.insert("businessSettings", {
        ownerId: args.ownerId,
        businessName: args.businessName,
        logoUrl: args.logoUrl,
        address: args.address,
        phone: args.phone,
        openingHours: args.openingHours,
        timezone: args.timezone || "America/Sao_Paulo",
        notificationSettings: args.notificationSettings || {},
        financialMetrics: {},
        createdAt: now,
        updatedAt: now,
      });
    }
  },
});

// RELACIONAMENTO PROFISSIONAIS-SERVIÇOS

// Buscar serviços de um profissional
export const getServicesByProfessional = query({
  args: { professionalId: v.id("usersProfessionals"), ownerId: v.string() },
  handler: async (ctx, args) => {
    const relations = await ctx.db
      .query("professionalServices")
      .withIndex("ownerId_professionalId", (q) => q.eq("ownerId", args.ownerId).eq("professionalId", args.professionalId))
      .collect();

    const serviceIds = relations.map(r => r.serviceId);
    const services = [];

    for (const serviceId of serviceIds) {
      const service = await ctx.db.get(serviceId);
      if (service) {
        services.push(service);
      }
    }

    return services;
  },
});

// Adicionar serviço a profissional
export const addServiceToProfessional = mutation({
  args: {
    ownerId: v.string(),
    professionalId: v.id("usersProfessionals"),
    serviceId: v.id("services"),
  },
  handler: async (ctx, args) => {
    // Verificar se já existe
    const existing = await ctx.db
      .query("professionalServices")
      .withIndex("ownerId_professionalId", (q) =>
        q.eq("ownerId", args.ownerId).eq("professionalId", args.professionalId)
      )
      .filter((q) => q.eq(q.field("serviceId"), args.serviceId))
      .first();

    if (existing) {
      throw new Error("Relação já existe");
    }

    return await ctx.db.insert("professionalServices", {
      ownerId: args.ownerId,
      professionalId: args.professionalId,
      serviceId: args.serviceId,
      createdAt: Date.now(),
    });
  },
});

// Remover serviço de profissional
export const removeServiceFromProfessional = mutation({
  args: {
    ownerId: v.string(),
    professionalId: v.id("usersProfessionals"),
    serviceId: v.id("services"),
  },
  handler: async (ctx, args) => {
    const relation = await ctx.db
      .query("professionalServices")
      .withIndex("ownerId_professionalId", (q) =>
        q.eq("ownerId", args.ownerId).eq("professionalId", args.professionalId)
      )
      .filter((q) => q.eq(q.field("serviceId"), args.serviceId))
      .first();

    if (!relation) {
      throw new Error("Relação não encontrada");
    }

    await ctx.db.delete(relation._id);
    return relation._id;
  },
});