import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Salvar ou atualizar disponibilidade
export const saveAvailability = mutation({
  args: {
    ownerId: v.string(),
    dayOfWeek: v.string(),
    hour: v.string(),
    isAvailable: v.boolean(),
  },
  handler: async (ctx, args) => {
    // Verificar se já existe um registro
    const existing = await ctx.db
      .query("availability")
      .withIndex("ownerId_day", (q) =>
        q.eq("ownerId", args.ownerId).eq("dayOfWeek", args.dayOfWeek)
      )
      .filter((q) => q.eq(q.field("hour"), args.hour))
      .first();

    const now = Date.now();

    if (existing) {
      // Atualizar
      await ctx.db.patch(existing._id, {
        isAvailable: args.isAvailable,
        updatedAt: now,
      });
      return existing._id;
    } else {
      // Criar novo
      const id = await ctx.db.insert("availability", {
        ownerId: args.ownerId,
        dayOfWeek: args.dayOfWeek,
        hour: args.hour,
        isAvailable: args.isAvailable,
        createdAt: now,
        updatedAt: now,
      });
      return id;
    }
  },
});

// Buscar toda a disponibilidade de um estabelecimento
export const getAvailability = query({
  args: {
    ownerId: v.string(),
  },
  handler: async (ctx, args) => {
    const availability = await ctx.db
      .query("availability")
      .withIndex("ownerId", (q) => q.eq("ownerId", args.ownerId))
      .collect();

    return availability;
  },
});

// Buscar disponibilidade de um dia específico
export const getAvailabilityByDay = query({
  args: {
    ownerId: v.string(),
    dayOfWeek: v.string(),
  },
  handler: async (ctx, args) => {
    const availability = await ctx.db
      .query("availability")
      .withIndex("ownerId_day", (q) =>
        q.eq("ownerId", args.ownerId).eq("dayOfWeek", args.dayOfWeek)
      )
      .collect();

    return availability;
  },
});

// Limpar toda a disponibilidade de um estabelecimento
export const clearAvailability = mutation({
  args: {
    ownerId: v.string(),
  },
  handler: async (ctx, args) => {
    const availability = await ctx.db
      .query("availability")
      .withIndex("ownerId", (q) => q.eq("ownerId", args.ownerId))
      .collect();

    for (const item of availability) {
      await ctx.db.delete(item._id);
    }

    return { deleted: availability.length };
  },
});

// Buscar disponibilidade real considerando agendamentos
export const getAvailabilityWithBookings = query({
  args: {
    professionalClerkId: v.string(),
    date: v.string(), // DD/MM/YYYY
    dayOfWeek: v.string(),
  },
  handler: async (ctx, args) => {
    // Horários padrão (08:00 - 20:00)
    const defaultHours = Array.from({ length: 13 }, (_, i) => {
      const hour = 8 + i;
      return `${hour.toString().padStart(2, '0')}:00`;
    });
    
    // Buscar configuração de disponibilidade (horários que o profissional trabalha)
    const availability = await ctx.db
      .query("availability")
      .withIndex("ownerId_day", (q) =>
        q.eq("ownerId", args.professionalClerkId).eq("dayOfWeek", args.dayOfWeek)
      )
      .collect();

    // Buscar agendamentos confirmados para esse profissional nesta data
    const appointments = await ctx.db
      .query("appointments")
      .withIndex("professionalClerkId", (q) => q.eq("professionalClerkId", args.professionalClerkId))
      .filter((q) => 
        q.and(
          q.eq(q.field("date"), args.date),
          q.eq(q.field("status"), "confirmed")
        )
      )
      .collect();

    // Criar um set com os horários já agendados
    const bookedHours = new Set(appointments.map(a => a.time));

    // Se não houver configuração de availability, usar horários padrão
    if (availability.length === 0) {
      return defaultHours.map(hour => ({
        ownerId: args.professionalClerkId,
        dayOfWeek: args.dayOfWeek,
        hour,
        isAvailable: !bookedHours.has(hour),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }));
    }

    // Filtrar disponibilidade removendo horários agendados
    return availability.map(slot => ({
      ...slot,
      isAvailable: slot.isAvailable && !bookedHours.has(slot.hour)
    }));
  },
});
