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

// Buscar agendamentos por data para qualquer usuário (owner ou professional)
export const getByDateForUser = query({
  args: {
    clerkId: v.string(),
    date: v.string(), // Formato brasileiro DD/MM/YYYY ou ISO YYYY-MM-DD
  },
  handler: async (ctx, args) => {
    // Converter data ISO para formato brasileiro se necessário
    let searchDate = args.date;
    if (args.date.includes('-')) {
      // Converter de YYYY-MM-DD para DD/MM/YYYY
      const [year, month, day] = args.date.split('-');
      searchDate = `${day}/${month}/${year}`;
    }

    // Buscar todos os agendamentos do dia que pertencem ao usuário como owner OU professional
    const appointments = await ctx.db
      .query("appointments")
      .filter((q) =>
        q.and(
          q.or(
            q.eq(q.field("ownerId"), args.clerkId),
            q.eq(q.field("professionalClerkId"), args.clerkId)
          ),
          q.eq(q.field("date"), searchDate)
        )
      )
      .collect();

    // Popular dados do cliente e serviço
    const appointmentsWithDetails = await Promise.all(
      appointments.map(async (appointment) => {
        const client = appointment.clientClerkId
          ? await ctx.db
              .query("userProfiles")
              .withIndex("by_clerk_id", (q) => q.eq("clerkId", appointment.clientClerkId))
              .first()
          : null;

        const service = appointment.serviceId
          ? await ctx.db.get(appointment.serviceId)
          : null;

        return {
          ...appointment,
          client,
          service,
        };
      })
    );

    return appointmentsWithDetails;
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

// Criar agendamento de cliente
export const createClientAppointment = mutation({
  args: {
    ownerId: v.string(),
    professionalClerkId: v.string(),
    clientClerkId: v.string(),
    clientName: v.string(),
    clientEmail: v.optional(v.string()),
    clientPhone: v.optional(v.string()),
    serviceId: v.id("services"),
    date: v.string(),
    time: v.string(),
    dayOfWeek: v.string(),
    totalValue: v.number(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Criar cliente automaticamente se não existir
    if (args.clientEmail || args.clientPhone) {
      const existingCustomers = await ctx.db
        .query("customers")
        .filter((q) => q.eq(q.field("ownerId"), args.ownerId))
        .collect();
      
      // Verificar se já existe cliente com mesmo email E telefone
      const customerExists = existingCustomers.some(c => {
        const sameEmail = args.clientEmail && c.email === args.clientEmail;
        const samePhone = args.clientPhone && c.phone === args.clientPhone;
        return (sameEmail && samePhone) || (sameEmail && !args.clientPhone);
      });

      if (!customerExists) {
        await ctx.db.insert("customers", {
          ownerId: args.ownerId,
          fullName: args.clientName,
          email: args.clientEmail,
          phone: args.clientPhone,
          registeredAt: now,
          status: "active",
          tags: [],
          avgRating: 0,
          totalVisits: 1,
          createdAt: now,
          updatedAt: now,
        });
      }
    }

    // Buscar informações do serviço
    const service = await ctx.db.get(args.serviceId);
    const appointmentId = await ctx.db.insert("appointments", {
      ownerId: args.ownerId,
      professionalClerkId: args.professionalClerkId,
      clientClerkId: args.clientClerkId,
      clientName: args.clientName,
      clientEmail: args.clientEmail,
      clientPhone: args.clientPhone,
      serviceId: args.serviceId,
      date: args.date,
      time: args.time,
      dayOfWeek: args.dayOfWeek,
      totalValue: args.totalValue,
      status: "confirmed",
      createdAt: now,
      updatedAt: now,
    });

    // Criar notificação para o profissional
    await ctx.db.insert("notifications", {
      recipientClerkId: args.professionalClerkId,
      type: "new_appointment",
      title: "Novo Agendamento",
      message: `${args.clientName} marcou um atendimento com você para ${args.dayOfWeek}, ${args.date} às ${args.time}. Serviço: ${service?.name || 'N/A'}`,
      appointmentId: appointmentId,
      data: {
        clientName: args.clientName,
        serviceName: service?.name,
        date: args.date,
        time: args.time,
        dayOfWeek: args.dayOfWeek,
        totalValue: args.totalValue,
      },
      isRead: false,
      createdAt: now,
    });

    return appointmentId;
  },
});

// Buscar agendamentos por profissional (clerkId)
export const getByProfessionalClerkId = query({
  args: {
    professionalClerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const appointments = await ctx.db
      .query("appointments")
      .withIndex("professionalClerkId", (q) =>
        q.eq("professionalClerkId", args.professionalClerkId)
      )
      .filter((q) => q.neq(q.field("status"), "cancelled"))
      .collect();

    // Buscar informações dos serviços e clientes
    const appointmentsWithDetails = await Promise.all(
      appointments.map(async (appointment) => {
        const service = await ctx.db.get(appointment.serviceId);
        
        const client = appointment.clientClerkId
          ? await ctx.db
              .query("userProfiles")
              .withIndex("by_clerk_id", (q) => q.eq("clerkId", appointment.clientClerkId))
              .first()
          : null;

        return {
          ...appointment,
          service,
          client,
        };
      })
    );

    return appointmentsWithDetails;
  },
});

// Buscar agendamentos por cliente (clerkId)
export const getByClientClerkId = query({
  args: {
    clientClerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const appointments = await ctx.db
      .query("appointments")
      .withIndex("clientClerkId", (q) =>
        q.eq("clientClerkId", args.clientClerkId)
      )
      .collect();

    // Buscar informações dos serviços e profissionais
    const appointmentsWithDetails = await Promise.all(
      appointments.map(async (appointment) => {
        const service = await ctx.db.get(appointment.serviceId);
        const professional = await ctx.db
          .query("userProfiles")
          .withIndex("by_clerk_id", (q) => q.eq("clerkId", appointment.professionalClerkId))
          .first();
        const owner = await ctx.db
          .query("userProfiles")
          .withIndex("by_clerk_id", (q) => q.eq("clerkId", appointment.ownerId))
          .first();
        
        return {
          ...appointment,
          service,
          professional,
          owner,
        };
      })
    );

    return appointmentsWithDetails;
  },
});

// Cancelar agendamento e liberar horário
export const cancelClientAppointment = mutation({
  args: {
    appointmentId: v.id("appointments"),
  },
  handler: async (ctx, args) => {
    const appointment = await ctx.db.get(args.appointmentId);
    
    if (!appointment) {
      throw new Error("Agendamento não encontrado");
    }

    const now = Date.now();

    // Buscar informações do serviço
    const service = await ctx.db.get(appointment.serviceId);

    // Atualizar status para cancelado
    await ctx.db.patch(args.appointmentId, {
      status: "cancelled",
      updatedAt: now,
    });

    // Criar notificação para o profissional
    await ctx.db.insert("notifications", {
      recipientClerkId: appointment.professionalClerkId,
      type: "cancelled_appointment",
      title: "Agendamento Cancelado",
      message: `${appointment.clientName} cancelou o atendimento de ${appointment.dayOfWeek}, ${appointment.date} às ${appointment.time}. Serviço: ${service?.name || 'N/A'}`,
      appointmentId: args.appointmentId,
      data: {
        clientName: appointment.clientName,
        serviceName: service?.name,
        date: appointment.date,
        time: appointment.time,
        dayOfWeek: appointment.dayOfWeek,
      },
      isRead: false,
      createdAt: now,
    });

    return { success: true };
  },
});

// Limpar (deletar permanentemente) agendamentos concluídos ou cancelados
export const clearCompletedAppointments = mutation({
  args: {
    clientClerkId: v.string(),
    appointmentIds: v.array(v.id("appointments")),
  },
  handler: async (ctx, args) => {
    // Verificar e deletar cada agendamento
    for (const appointmentId of args.appointmentIds) {
      const appointment = await ctx.db.get(appointmentId);
      
      if (!appointment) {
        continue; // Pular se não encontrado
      }

      // Verificar se o agendamento pertence ao cliente
      if (appointment.clientClerkId !== args.clientClerkId) {
        throw new Error("Você não tem permissão para deletar este agendamento");
      }

      // Só permitir deletar se estiver concluído ou cancelado
      if (appointment.status === "completed" || appointment.status === "cancelled") {
        await ctx.db.delete(appointmentId);
      } else {
        throw new Error("Apenas agendamentos concluídos ou cancelados podem ser removidos");
      }
    }

    return { success: true, deleted: args.appointmentIds.length };
  },
});