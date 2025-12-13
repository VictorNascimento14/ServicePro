import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// HISTÓRICO DE ATENDIMENTOS

// Buscar histórico por agendamento
export const getByAppointment = query({
  args: {
    ownerId: v.string(),
    appointmentId: v.id("appointments"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("serviceHistory")
      .withIndex("ownerId_appointmentId", (q) => q.eq("ownerId", args.ownerId).eq("appointmentId", args.appointmentId))
      .collect();
  },
});

// Buscar histórico por data
export const getByDate = query({
  args: {
    ownerId: v.string(),
    serviceDate: v.string(), // ISO date string
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("serviceHistory")
      .withIndex("ownerId_serviceDate", (q) => q.eq("ownerId", args.ownerId).eq("serviceDate", args.serviceDate))
      .collect();
  },
});

// Buscar histórico por cliente (através de agendamentos)
export const getByCustomer = query({
  args: {
    ownerId: v.string(),
    customerId: v.id("customers"),
  },
  handler: async (ctx, args) => {
    // Primeiro buscar agendamentos do cliente
    const appointments = await ctx.db
      .query("appointments")
      .withIndex("ownerId_customerId", (q) => q.eq("ownerId", args.ownerId).eq("customerId", args.customerId))
      .collect();

    const appointmentIds = appointments.map(a => a._id);

    // Depois buscar histórico para esses agendamentos
    const history = [];
    for (const appointmentId of appointmentIds) {
      const records = await ctx.db
        .query("serviceHistory")
        .withIndex("ownerId_appointmentId", (q) => q.eq("ownerId", args.ownerId).eq("appointmentId", appointmentId))
        .collect();
      history.push(...records);
    }

    return history;
  },
});

// Criar registro de histórico
export const create = mutation({
  args: {
    ownerId: v.string(),
    appointmentId: v.id("appointments"),
    serviceDate: v.string(),
    customerRating: v.optional(v.number()),
    comments: v.optional(v.string()),
    amountPaid: v.number(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    return await ctx.db.insert("serviceHistory", {
      ownerId: args.ownerId,
      appointmentId: args.appointmentId,
      serviceDate: args.serviceDate,
      customerRating: args.customerRating,
      comments: args.comments,
      amountPaid: args.amountPaid,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Atualizar histórico
export const update = mutation({
  args: {
    id: v.id("serviceHistory"),
    ownerId: v.string(),
    customerRating: v.optional(v.number()),
    comments: v.optional(v.string()),
    amountPaid: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const record = await ctx.db.get(args.id);
    if (!record || record.ownerId !== args.ownerId) {
      throw new Error("Registro de histórico não encontrado ou não pertence ao owner");
    }

    await ctx.db.patch(args.id, {
      ...args,
      updatedAt: Date.now(),
    });

    return args.id;
  },
});

// Deletar histórico
export const deleteHistory = mutation({
  args: { id: v.id("serviceHistory"), ownerId: v.string() },
  handler: async (ctx, args) => {
    const record = await ctx.db.get(args.id);
    if (!record || record.ownerId !== args.ownerId) {
      throw new Error("Registro de histórico não encontrado ou não pertence ao owner");
    }

    await ctx.db.delete(args.id);
    return args.id;
  },
});