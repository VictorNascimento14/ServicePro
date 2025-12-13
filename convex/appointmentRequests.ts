import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// SOLICITAÇÕES DE AGENDAMENTO

// Buscar todas as solicitações
export const getAll = query({
  args: { ownerId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("appointmentRequests")
      .filter((q) => q.eq(q.field("ownerId"), args.ownerId))
      .collect();
  },
});

// Buscar solicitações por status
export const getByStatus = query({
  args: {
    ownerId: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("rejected")
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("appointmentRequests")
      .withIndex("ownerId_status", (q) => q.eq("ownerId", args.ownerId).eq("status", args.status))
      .collect();
  },
});

// Buscar solicitação por ID
export const getById = query({
  args: { id: v.id("appointmentRequests"), ownerId: v.string() },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.id);
    if (!request || request.ownerId !== args.ownerId) {
      throw new Error("Solicitação não encontrada ou não pertence ao owner");
    }
    return request;
  },
});

// Criar nova solicitação
export const create = mutation({
  args: {
    ownerId: v.string(),
    customerId: v.id("customers"),
    serviceId: v.id("services"),
    requestedDatetime: v.number(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    return await ctx.db.insert("appointmentRequests", {
      ownerId: args.ownerId,
      customerId: args.customerId,
      serviceId: args.serviceId,
      requestedDatetime: args.requestedDatetime,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Atualizar status da solicitação
export const updateStatus = mutation({
  args: {
    id: v.id("appointmentRequests"),
    ownerId: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("rejected")
    ),
  },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.id);
    if (!request || request.ownerId !== args.ownerId) {
      throw new Error("Solicitação não encontrada ou não pertence ao owner");
    }

    await ctx.db.patch(args.id, {
      status: args.status,
      updatedAt: Date.now(),
    });

    return args.id;
  },
});

// Deletar solicitação
export const deleteRequest = mutation({
  args: { id: v.id("appointmentRequests"), ownerId: v.string() },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.id);
    if (!request || request.ownerId !== args.ownerId) {
      throw new Error("Solicitação não encontrada ou não pertence ao owner");
    }

    await ctx.db.delete(args.id);
    return args.id;
  },
});