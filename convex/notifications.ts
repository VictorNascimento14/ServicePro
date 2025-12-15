import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Buscar notificações do usuário
export const getByRecipient = query({
  args: { recipientClerkId: v.string() },
  handler: async (ctx, args) => {
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("recipientClerkId", (q) => 
        q.eq("recipientClerkId", args.recipientClerkId)
      )
      .order("desc")
      .collect();

    return notifications;
  },
});

// Buscar notificações não lidas
export const getUnreadByRecipient = query({
  args: { recipientClerkId: v.string() },
  handler: async (ctx, args) => {
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("recipientClerkId_isRead", (q) => 
        q.eq("recipientClerkId", args.recipientClerkId).eq("isRead", false)
      )
      .order("desc")
      .collect();

    return notifications;
  },
});

// Contar notificações não lidas
export const countUnread = query({
  args: { recipientClerkId: v.string() },
  handler: async (ctx, args) => {
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("recipientClerkId_isRead", (q) => 
        q.eq("recipientClerkId", args.recipientClerkId).eq("isRead", false)
      )
      .collect();

    return notifications.length;
  },
});

// Criar notificação
export const create = mutation({
  args: {
    recipientClerkId: v.string(),
    type: v.union(
      v.literal("new_appointment"),
      v.literal("cancelled_appointment"),
      v.literal("appointment_reminder")
    ),
    title: v.string(),
    message: v.string(),
    appointmentId: v.optional(v.id("appointments")),
    data: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const notificationId = await ctx.db.insert("notifications", {
      recipientClerkId: args.recipientClerkId,
      type: args.type,
      title: args.title,
      message: args.message,
      appointmentId: args.appointmentId,
      data: args.data,
      isRead: false,
      createdAt: Date.now(),
    });

    return notificationId;
  },
});

// Marcar como lida
export const markAsRead = mutation({
  args: { id: v.id("notifications") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { isRead: true });
  },
});

// Marcar todas como lidas
export const markAllAsRead = mutation({
  args: { recipientClerkId: v.string() },
  handler: async (ctx, args) => {
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("recipientClerkId_isRead", (q) => 
        q.eq("recipientClerkId", args.recipientClerkId).eq("isRead", false)
      )
      .collect();

    for (const notification of notifications) {
      await ctx.db.patch(notification._id, { isRead: true });
    }
  },
});

// Deletar notificação
export const remove = mutation({
  args: { id: v.id("notifications") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
