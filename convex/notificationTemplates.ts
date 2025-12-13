import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// TEMPLATES DE NOTIFICAÇÃO

// Buscar todos os templates ativos
export const getActiveTemplates = query({
  args: { ownerId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("notificationTemplates")
      .withIndex("ownerId_active", (q) => q.eq("ownerId", args.ownerId).eq("active", true))
      .collect();
  },
});

// Buscar templates por tipo
export const getByType = query({
  args: {
    ownerId: v.string(),
    type: v.union(
      v.literal("confirmation"),
      v.literal("reminder"),
      v.literal("cancellation")
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("notificationTemplates")
      .withIndex("ownerId_type", (q) => q.eq("ownerId", args.ownerId).eq("type", args.type))
      .collect();
  },
});

// Buscar template por ID
export const getById = query({
  args: { id: v.id("notificationTemplates"), ownerId: v.string() },
  handler: async (ctx, args) => {
    const template = await ctx.db.get(args.id);
    if (!template || template.ownerId !== args.ownerId) {
      throw new Error("Template não encontrado ou não pertence ao owner");
    }
    return template;
  },
});

// Criar novo template
export const create = mutation({
  args: {
    ownerId: v.string(),
    name: v.string(),
    type: v.union(
      v.literal("confirmation"),
      v.literal("reminder"),
      v.literal("cancellation")
    ),
    content: v.string(),
    professionalId: v.optional(v.id("usersProfessionals")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    return await ctx.db.insert("notificationTemplates", {
      ownerId: args.ownerId,
      name: args.name,
      type: args.type,
      content: args.content,
      active: true,
      professionalId: args.professionalId,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Atualizar template
export const update = mutation({
  args: {
    id: v.id("notificationTemplates"),
    ownerId: v.string(),
    name: v.optional(v.string()),
    content: v.optional(v.string()),
    active: v.optional(v.boolean()),
    professionalId: v.optional(v.id("usersProfessionals")),
  },
  handler: async (ctx, args) => {
    const template = await ctx.db.get(args.id);
    if (!template || template.ownerId !== args.ownerId) {
      throw new Error("Template não encontrado ou não pertence ao owner");
    }

    await ctx.db.patch(args.id, {
      ...args,
      updatedAt: Date.now(),
    });

    return args.id;
  },
});

// Deletar template
export const deleteTemplate = mutation({
  args: { id: v.id("notificationTemplates"), ownerId: v.string() },
  handler: async (ctx, args) => {
    const template = await ctx.db.get(args.id);
    if (!template || template.ownerId !== args.ownerId) {
      throw new Error("Template não encontrado ou não pertence ao owner");
    }

    await ctx.db.delete(args.id);
    return args.id;
  },
});