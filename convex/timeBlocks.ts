import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// BLOQUEIOS DE HORÁRIO

// Buscar bloqueios por profissional
export const getByProfessional = query({
  args: {
    ownerId: v.string(),
    professionalId: v.id("usersProfessionals"),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("timeBlocks").withIndex("ownerId_professionalId", (q) =>
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

// Buscar bloqueio por ID
export const getById = query({
  args: { id: v.id("timeBlocks"), ownerId: v.string() },
  handler: async (ctx, args) => {
    const block = await ctx.db.get(args.id);
    if (!block || block.ownerId !== args.ownerId) {
      throw new Error("Bloqueio não encontrado ou não pertence ao owner");
    }
    return block;
  },
});

// Criar novo bloqueio
export const create = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    return await ctx.db.insert("timeBlocks", {
      ownerId: args.ownerId,
      professionalId: args.professionalId,
      startDatetime: args.startDatetime,
      endDatetime: args.endDatetime,
      reason: args.reason,
      type: args.type,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Atualizar bloqueio
export const update = mutation({
  args: {
    id: v.id("timeBlocks"),
    ownerId: v.string(),
    startDatetime: v.optional(v.number()),
    endDatetime: v.optional(v.number()),
    reason: v.optional(v.string()),
    type: v.optional(v.union(
      v.literal("unavailable"),
      v.literal("vacation"),
      v.literal("lunch")
    )),
  },
  handler: async (ctx, args) => {
    const block = await ctx.db.get(args.id);
    if (!block || block.ownerId !== args.ownerId) {
      throw new Error("Bloqueio não encontrado ou não pertence ao owner");
    }

    await ctx.db.patch(args.id, {
      ...args,
      updatedAt: Date.now(),
    });

    return args.id;
  },
});

// Deletar bloqueio
export const deleteBlock = mutation({
  args: { id: v.id("timeBlocks"), ownerId: v.string() },
  handler: async (ctx, args) => {
    const block = await ctx.db.get(args.id);
    if (!block || block.ownerId !== args.ownerId) {
      throw new Error("Bloqueio não encontrado ou não pertence ao owner");
    }

    await ctx.db.delete(args.id);
    return args.id;
  },
});