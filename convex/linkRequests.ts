import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Buscar todas as barbearias disponíveis para funcionários solicitarem vínculo
export const getAvailableBusinesses = query({
  args: {},
  handler: async (ctx) => {
    const allProfiles = await ctx.db.query("userProfiles").collect();
    
    // Filtrar apenas donos de estabelecimento
    return allProfiles.filter(profile => 
      profile.userType === 'business' && profile.isOwner === true
    );
  },
});

// Criar solicitação de vínculo
export const createLinkRequest = mutation({
  args: {
    employeeId: v.string(),
    ownerId: v.string(),
    employeeName: v.string(),
    employeePhone: v.optional(v.string()),
    employeeExperience: v.optional(v.string()),
    employeeServices: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    // Verificar se já existe uma solicitação pendente
    const existing = await ctx.db
      .query("linkRequests")
      .withIndex("employeeId", (q) => q.eq("employeeId", args.employeeId))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .first();

    if (existing) {
      throw new Error("Você já possui uma solicitação pendente");
    }

    const now = Date.now();
    
    return await ctx.db.insert("linkRequests", {
      employeeId: args.employeeId,
      ownerId: args.ownerId,
      employeeName: args.employeeName,
      employeePhone: args.employeePhone,
      employeeExperience: args.employeeExperience,
      employeeServices: args.employeeServices,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Buscar solicitações pendentes para um dono de barbearia
export const getPendingRequests = query({
  args: { ownerId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("linkRequests")
      .withIndex("ownerId_status", (q) => q.eq("ownerId", args.ownerId).eq("status", "pending"))
      .collect();
  },
});

// Buscar status da solicitação do funcionário
export const getEmployeeRequest = query({
  args: { employeeId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("linkRequests")
      .withIndex("employeeId", (q) => q.eq("employeeId", args.employeeId))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .first();
  },
});

// Aceitar solicitação de vínculo
export const acceptLinkRequest = mutation({
  args: { requestId: v.id("linkRequests") },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.requestId);
    
    if (!request) {
      throw new Error("Solicitação não encontrada");
    }

    // Atualizar status da solicitação
    await ctx.db.patch(args.requestId, {
      status: "accepted",
      updatedAt: Date.now(),
    });

    // Vincular funcionário ao dono
    const employeeProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", request.employeeId))
      .first();

    if (employeeProfile) {
      await ctx.db.patch(employeeProfile._id, {
        linkedToOwnerId: request.ownerId,
        updatedAt: Date.now(),
      });
    }

    return { success: true };
  },
});

// Rejeitar solicitação de vínculo
export const rejectLinkRequest = mutation({
  args: { requestId: v.id("linkRequests") },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.requestId);
    
    if (!request) {
      throw new Error("Solicitação não encontrada");
    }

    await ctx.db.patch(args.requestId, {
      status: "rejected",
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Buscar funcionários vinculados a uma barbearia
export const getLinkedEmployees = query({
  args: { ownerId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("userProfiles")
      .withIndex("linkedToOwnerId", (q) => q.eq("linkedToOwnerId", args.ownerId))
      .collect();
  },
});
