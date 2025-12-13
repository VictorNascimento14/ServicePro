import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// BARBEARIAS (para clientes visualizarem)

// Buscar todas as barbearias
export const getBarbearias = query({
  args: { city: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const allProfiles = await ctx.db.query("userProfiles").collect();
    
    // Filtrar apenas barbearias (barber ou business)
    let barbearias = allProfiles.filter(profile => 
      profile.userType === 'barber' || profile.userType === 'business'
    );
    
    // Filtrar por cidade se fornecida
    if (args.city) {
      barbearias = barbearias.filter(b => 
        b.location?.toLowerCase().includes(args.city.toLowerCase())
      );
    }
    
    return barbearias;
  },
});

// PROFISSIONAIS

// Buscar todos os profissionais ativos
export const getActiveProfessionals = query({
  args: { ownerId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("usersProfessionals")
      .withIndex("ownerId_status", (q) => q.eq("ownerId", args.ownerId).eq("status", "active"))
      .collect();
  },
});

// Buscar profissional por ID
export const getById = query({
  args: { id: v.id("usersProfessionals"), ownerId: v.string() },
  handler: async (ctx, args) => {
    const professional = await ctx.db.get(args.id);
    if (!professional || professional.ownerId !== args.ownerId) {
      throw new Error("Profissional não encontrado ou não pertence ao owner");
    }
    return professional;
  },
});

// Criar novo profissional
export const create = mutation({
  args: {
    ownerId: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    role: v.string(),
    calendarColor: v.string(),
  },
  handler: async (ctx, args) => {
    // Verificar se email já existe para este owner
    const existing = await ctx.db
      .query("usersProfessionals")
      .withIndex("ownerId_email", (q) => q.eq("ownerId", args.ownerId).eq("email", args.email))
      .first();

    if (existing) {
      return existing._id; // Retornar ID existente
    }

    const now = Date.now();

    return await ctx.db.insert("usersProfessionals", {
      ownerId: args.ownerId,
      firstName: args.firstName,
      lastName: args.lastName,
      email: args.email,
      phone: args.phone,
      role: args.role,
      calendarColor: args.calendarColor,
      status: "active",
      notificationSettings: {},
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Atualizar profissional
export const update = mutation({
  args: {
    id: v.id("usersProfessionals"),
    ownerId: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    role: v.optional(v.string()),
    calendarColor: v.optional(v.string()),
    status: v.optional(v.union(v.literal("active"), v.literal("inactive"))),
  },
  handler: async (ctx, args) => {
    const professional = await ctx.db.get(args.id);
    if (!professional || professional.ownerId !== args.ownerId) {
      throw new Error("Profissional não encontrado ou não pertence ao owner");
    }

    // Verificar email único para este owner se estiver sendo alterado
    if (args.email && args.email !== professional.email) {
      const existing = await ctx.db
        .query("usersProfessionals")
        .filter((q) => q.and(
          q.eq(q.field("ownerId"), args.ownerId),
          q.eq(q.field("email"), args.email)
        ))
        .first();

      if (existing) {
        throw new Error("Email já cadastrado para este owner");
      }
    }

    await ctx.db.patch(args.id, {
      ...args,
      updatedAt: Date.now(),
    });

    return args.id;
  },
});

// CLIENTES

// Buscar todos os clientes ativos
export const getActiveCustomers = query({
  args: { ownerId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("customers")
      .withIndex("ownerId_status", (q) => q.eq("ownerId", args.ownerId).eq("status", "active"))
      .collect();
  },
});

// Buscar cliente por ID
export const getCustomerById = query({
  args: { id: v.id("customers"), ownerId: v.string() },
  handler: async (ctx, args) => {
    const customer = await ctx.db.get(args.id);
    if (!customer || customer.ownerId !== args.ownerId) {
      throw new Error("Cliente não encontrado ou não pertence ao owner");
    }
    return customer;
  },
});

// Criar novo cliente
export const createCustomer = mutation({
  args: {
    ownerId: v.string(),
    fullName: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    birthDate: v.optional(v.string()),
    addressCity: v.optional(v.string()),
    addressState: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    preferences: v.optional(v.string()),
    allergies: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Verificar se email já existe para este owner (se fornecido)
    if (args.email) {
      const existing = await ctx.db
        .query("customers")
        .withIndex("ownerId_email", (q) => q.eq("ownerId", args.ownerId).eq("email", args.email))
        .first();

      if (existing) {
        return existing._id; // Retornar ID existente
      }
    }

    const now = Date.now();

    return await ctx.db.insert("customers", {
      ownerId: args.ownerId,
      fullName: args.fullName,
      email: args.email,
      phone: args.phone,
      birthDate: args.birthDate,
      addressCity: args.addressCity,
      addressState: args.addressState,
      tags: args.tags || [],
      preferences: args.preferences,
      allergies: args.allergies,
      status: "active",
      avgRating: 0,
      totalVisits: 0,
      registeredAt: now,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Atualizar cliente
export const updateCustomer = mutation({
  args: {
    id: v.id("customers"),
    ownerId: v.string(),
    fullName: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    birthDate: v.optional(v.string()),
    addressCity: v.optional(v.string()),
    addressState: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    preferences: v.optional(v.string()),
    allergies: v.optional(v.string()),
    status: v.optional(v.union(v.literal("active"), v.literal("inactive"))),
  },
  handler: async (ctx, args) => {
    const customer = await ctx.db.get(args.id);
    if (!customer || customer.ownerId !== args.ownerId) {
      throw new Error("Cliente não encontrado ou não pertence ao owner");
    }

    // Verificar email único para este owner se estiver sendo alterado
    if (args.email && args.email !== customer.email) {
      const existing = await ctx.db
        .query("customers")
        .withIndex("ownerId_email", (q) => q.eq("ownerId", args.ownerId).eq("email", args.email))
        .first();

      if (existing) {
        throw new Error("Email já cadastrado para este owner");
      }
    }

    await ctx.db.patch(args.id, {
      ...args,
      updatedAt: Date.now(),
    });

    return args.id;
  },
});

// Buscar clientes por tag
export const getCustomersByTag = query({
  args: { tag: v.string(), ownerId: v.string() },
  handler: async (ctx, args) => {
    const allCustomers = await ctx.db
      .query("customers")
      .filter((q) => q.eq(q.field("ownerId"), args.ownerId))
      .collect();
    
    return allCustomers.filter(customer => customer.tags.includes(args.tag));
  },
});

// PERFIL DO USUÁRIO (CLERK INTEGRATION)

// Buscar perfil do usuário por Clerk ID
export const getUserProfile = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("userProfiles")
      .withIndex("clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();
  },
});

// Buscar perfil do owner vinculado (para funcionários)
export const getLinkedOwnerProfile = query({
  args: { linkedToOwnerId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("userProfiles")
      .withIndex("clerkId", (q) => q.eq("clerkId", args.linkedToOwnerId))
      .first();
  },
});

// Criar ou atualizar perfil do usuário
export const updateUserProfile = mutation({
  args: {
    clerkId: v.string(),
    userName: v.optional(v.string()),
    userType: v.string(),
    businessName: v.optional(v.string()),
    services: v.array(v.string()),
    experience: v.optional(v.string()),
    location: v.optional(v.string()),
    address: v.optional(v.string()),
    phone: v.optional(v.string()),
    preferences: v.array(v.string()),
    availability: v.optional(v.string()),
    onboardingCompleted: v.boolean(),
    isOwner: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("userProfiles")
      .withIndex("clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    const now = Date.now();

    if (existing) {
      // Atualizar perfil existente
      await ctx.db.patch(existing._id, {
        ...args,
        updatedAt: now,
      });
      return existing._id;
    } else {
      // Criar novo perfil
      return await ctx.db.insert("userProfiles", {
        ...args,
        createdAt: now,
        updatedAt: now,
      });
    }
  },
});

// Resetar perfil do usuário (para testes)
export const resetUserProfile = mutation({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("userProfiles")
      .withIndex("clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
      return true;
    }
    return false;
  },
});