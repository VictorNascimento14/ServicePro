import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Buscar todos os agendamentos com paginação
export const getAll = query({
  args: {
    ownerId: v.string(),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    const offset = args.offset || 0;

    return await ctx.db
      .query("appointments")
      .filter((q) => q.eq(q.field("ownerId"), args.ownerId))
      .paginate({
        numItems: limit,
        cursor: null,
      });
  },
});

// Buscar agendamentos por profissional
export const getByProfessional = query({
  args: {
    ownerId: v.string(),
    professionalId: v.id("usersProfessionals"),
    startDate: v.optional(v.string()), // ISO date string
    endDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("appointments").withIndex("ownerId_professionalId", (q) =>
      q.eq("ownerId", args.ownerId).eq("professionalId", args.professionalId)
    );

    if (args.startDate && args.endDate) {
      const startTimestamp = new Date(args.startDate).getTime();
      const endTimestamp = new Date(args.endDate).getTime();
      query = query.filter((q) =>
        q.and(
          q.gte(q.field("startDatetime"), startTimestamp),
          q.lte(q.field("startDatetime"), endTimestamp)
        )
      );
    }

    return await query.collect();
  },
});

// Buscar agendamentos por cliente
export const getByCustomer = query({
  args: {
    ownerId: v.string(),
    customerId: v.id("customers"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("appointments")
      .withIndex("ownerId_customerId", (q) => q.eq("ownerId", args.ownerId).eq("customerId", args.customerId))
      .collect();
  },
});

// Buscar agendamento por ID
export const getById = query({
  args: { id: v.id("appointments"), ownerId: v.string() },
  handler: async (ctx, args) => {
    const appointment = await ctx.db.get(args.id);
    if (!appointment || appointment.ownerId !== args.ownerId) {
      throw new Error("Agendamento não encontrado ou não pertence ao owner");
    }
    return appointment;
  },
});

// Criar novo agendamento
export const create = mutation({
  args: {
    ownerId: v.string(),
    startDatetime: v.number(),
    endDatetime: v.number(),
    customerId: v.id("customers"),
    professionalId: v.id("usersProfessionals"),
    serviceId: v.id("services"),
    notes: v.optional(v.string()),
    totalValue: v.number(),
  },
  handler: async (ctx, args) => {
    // Verificar se há conflito de horário
    const conflictingAppointments = await ctx.db
      .query("appointments")
      .withIndex("ownerId_professionalId", (q) =>
        q.eq("ownerId", args.ownerId).eq("professionalId", args.professionalId)
      )
      .filter((q) =>
        q.and(
          q.lt(q.field("startDatetime"), args.endDatetime),
          q.gt(q.field("endDatetime"), args.startDatetime),
          q.or(
            q.eq(q.field("status"), "confirmed"),
            q.eq(q.field("status"), "pending")
          )
        )
      )
      .collect();

    if (conflictingAppointments.length > 0) {
      throw new Error("Horário conflitante com outro agendamento");
    }

    // Verificar bloqueios de horário
    const conflictingBlocks = await ctx.db
      .query("timeBlocks")
      .withIndex("ownerId_professionalId", (q) =>
        q.eq("ownerId", args.ownerId).eq("professionalId", args.professionalId)
      )
      .filter((q) =>
        q.and(
          q.lt(q.field("startDatetime"), args.endDatetime),
          q.gt(q.field("endDatetime"), args.startDatetime)
        )
      )
      .collect();

    if (conflictingBlocks.length > 0) {
      throw new Error("Horário bloqueado pelo profissional");
    }

    const now = Date.now();

    return await ctx.db.insert("appointments", {
      ownerId: args.ownerId,
      startDatetime: args.startDatetime,
      endDatetime: args.endDatetime,
      customerId: args.customerId,
      professionalId: args.professionalId,
      serviceId: args.serviceId,
      status: "pending",
      totalValue: args.totalValue,
      notes: args.notes,
      checkInDone: false,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Atualizar status do agendamento
export const updateStatus = mutation({
  args: {
    id: v.id("appointments"),
    ownerId: v.string(),
    status: v.union(
      v.literal("confirmed"),
      v.literal("pending"),
      v.literal("cancelled"),
      v.literal("completed")
    ),
  },
  handler: async (ctx, args) => {
    const appointment = await ctx.db.get(args.id);
    if (!appointment || appointment.ownerId !== args.ownerId) {
      throw new Error("Agendamento não encontrado ou não pertence ao owner");
    }

    await ctx.db.patch(args.id, {
      status: args.status,
      updatedAt: Date.now(),
    });

    return args.id;
  },
});

// Atualizar agendamento
export const update = mutation({
  args: {
    id: v.id("appointments"),
    ownerId: v.string(),
    startDatetime: v.optional(v.number()),
    endDatetime: v.optional(v.number()),
    customerId: v.optional(v.id("customers")),
    professionalId: v.optional(v.id("usersProfessionals")),
    serviceId: v.optional(v.id("services")),
    notes: v.optional(v.string()),
    totalValue: v.optional(v.number()),
    paymentMethod: v.optional(v.union(v.literal("online"), v.literal("cash"), v.literal("card"))),
  },
  handler: async (ctx, args) => {
    const appointment = await ctx.db.get(args.id);
    if (!appointment || appointment.ownerId !== args.ownerId) {
      throw new Error("Agendamento não encontrado ou não pertence ao owner");
    }

    // Se horário mudou, verificar conflitos
    if (args.startDatetime !== undefined && args.endDatetime !== undefined && args.professionalId !== undefined) {
      const professionalId = args.professionalId;
      const startDatetime = args.startDatetime;
      const endDatetime = args.endDatetime;
      
      const conflictingAppointments = await ctx.db
        .query("appointments")
        .withIndex("ownerId_professionalId", (q) =>
          q.eq("ownerId", args.ownerId).eq("professionalId", professionalId)
        )
        .filter((q) =>
          q.and(
            q.neq(q.field("_id"), args.id), // Excluir o próprio agendamento
            q.lt(q.field("startDatetime"), endDatetime),
            q.gt(q.field("endDatetime"), startDatetime),
            q.or(
              q.eq(q.field("status"), "confirmed"),
              q.eq(q.field("status"), "pending")
            )
          )
        )
        .collect();

      if (conflictingAppointments.length > 0) {
        throw new Error("Horário conflitante com outro agendamento");
      }
    }

    await ctx.db.patch(args.id, {
      ...args,
      updatedAt: Date.now(),
    });

    return args.id;
  },
});

// Marcar check-in
export const checkIn = mutation({
  args: {
    id: v.id("appointments"),
    ownerId: v.string(),
  },
  handler: async (ctx, args) => {
    const appointment = await ctx.db.get(args.id);
    if (!appointment || appointment.ownerId !== args.ownerId) {
      throw new Error("Agendamento não encontrado ou não pertence ao owner");
    }

    await ctx.db.patch(args.id, {
      checkInDone: true,
      updatedAt: Date.now(),
    });

    return args.id;
  },
});

// Buscar agendamentos para um dia específico
export const getByDate = query({
  args: {
    ownerId: v.string(),
    date: v.string(), // ISO date string (YYYY-MM-DD)
  },
  handler: async (ctx, args) => {
    const startOfDay = new Date(args.date + "T00:00:00.000Z").getTime();
    const endOfDay = new Date(args.date + "T23:59:59.999Z").getTime();

    return await ctx.db
      .query("appointments")
      .filter((q) =>
        q.and(
          q.eq(q.field("ownerId"), args.ownerId),
          q.gte(q.field("startDatetime"), startOfDay),
          q.lte(q.field("startDatetime"), endOfDay)
        )
      )
      .collect();
  },
});

// Deletar agendamento (soft delete)
export const deleteAppointment = mutation({
  args: { id: v.id("appointments"), ownerId: v.string() },
  handler: async (ctx, args) => {
    const appointment = await ctx.db.get(args.id);
    if (!appointment || appointment.ownerId !== args.ownerId) {
      throw new Error("Agendamento não encontrado ou não pertence ao owner");
    }

    await ctx.db.patch(args.id, {
      status: "cancelled",
      deletedAt: Date.now(),
      updatedAt: Date.now(),
    });

    return args.id;
  },
});