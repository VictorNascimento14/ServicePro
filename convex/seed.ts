import { action } from "./_generated/server";

// Função para limpar o banco de dados
export const clearDatabase = action({
  handler: async (ctx) => {
    // Deletar em ordem reversa de dependências
    const appointments = await ctx.db.query("appointments").collect();
    for (const app of appointments) {
      await ctx.db.delete(app._id);
    }

    const serviceHistory = await ctx.db.query("serviceHistory").collect();
    for (const sh of serviceHistory) {
      await ctx.db.delete(sh._id);
    }

    const appointmentRequests = await ctx.db.query("appointmentRequests").collect();
    for (const ar of appointmentRequests) {
      await ctx.db.delete(ar._id);
    }

    const timeBlocks = await ctx.db.query("timeBlocks").collect();
    for (const tb of timeBlocks) {
      await ctx.db.delete(tb._id);
    }

    const professionalServices = await ctx.db.query("professionalServices").collect();
    for (const ps of professionalServices) {
      await ctx.db.delete(ps._id);
    }

    const notificationTemplates = await ctx.db.query("notificationTemplates").collect();
    for (const nt of notificationTemplates) {
      await ctx.db.delete(nt._id);
    }

    const businessSettings = await ctx.db.query("businessSettings").collect();
    for (const bs of businessSettings) {
      await ctx.db.delete(bs._id);
    }

    const services = await ctx.db.query("services").collect();
    for (const s of services) {
      await ctx.db.delete(s._id);
    }

    const customers = await ctx.db.query("customers").collect();
    for (const c of customers) {
      await ctx.db.delete(c._id);
    }

    const usersProfessionals = await ctx.db.query("usersProfessionals").collect();
    for (const up of usersProfessionals) {
      await ctx.db.delete(up._id);
    }

    return { message: "Database cleared" };
  },
});
export const seedDatabase = action({
  handler: async (ctx) => {
    // Profissionais
    const professional1 = await ctx.runMutation("users:create", {
      firstName: "Sarah",
      lastName: "Jenkins",
      email: "sarah.jenkins@servicepro.com",
      phone: "+5511999999999",
      role: "Senior Stylist",
      calendarColor: "#FF6B6B",
    });

    const professional2 = await ctx.runMutation("users:create", {
      firstName: "Michael",
      lastName: "Chen",
      email: "michael.chen@servicepro.com",
      phone: "+5511988888888",
      role: "Barber",
      calendarColor: "#4ECDC4",
    });

    const professional3 = await ctx.runMutation("users:create", {
      firstName: "Elara",
      lastName: "Vane",
      email: "elara.vane@servicepro.com",
      phone: "+5511977777777",
      role: "Color Specialist",
      calendarColor: "#45B7D1",
    });

    // Clientes
    const customer1 = await ctx.runMutation("users:createCustomer", {
      fullName: "João Silva",
      email: "joao.silva@email.com",
      phone: "+5511966666666",
      birthDate: "1990-05-15",
      addressCity: "São Paulo",
      addressState: "SP",
      tags: ["VIP", "Pagador Pontual"],
      preferences: "Prefere horários matinais",
    });

    const customer2 = await ctx.runMutation("users:createCustomer", {
      fullName: "Maria Santos",
      email: "maria.santos@email.com",
      phone: "+5511955555555",
      birthDate: "1985-08-22",
      addressCity: "São Paulo",
      addressState: "SP",
      tags: ["VIP"],
      allergies: "Alergia a produtos químicos",
    });

    const customer3 = await ctx.runMutation("users:createCustomer", {
      fullName: "Pedro Oliveira",
      email: "pedro.oliveira@email.com",
      phone: "+5511944444444",
      birthDate: "1992-12-10",
      addressCity: "São Paulo",
      addressState: "SP",
      tags: ["Novo Cliente"],
      preferences: "Primeira visita",
    });

    const customer4 = await ctx.runMutation("users:createCustomer", {
      fullName: "Ana Costa",
      email: "ana.costa@email.com",
      phone: "+5511933333333",
      birthDate: "1988-03-30",
      addressCity: "São Paulo",
      addressState: "SP",
      tags: ["Regular"],
      preferences: "Corte tradicional",
    });

    const customer5 = await ctx.runMutation("users:createCustomer", {
      fullName: "Carlos Ferreira",
      email: "carlos.ferreira@email.com",
      phone: "+5511922222222",
      birthDate: "1995-07-18",
      addressCity: "São Paulo",
      addressState: "SP",
      tags: ["VIP"],
      preferences: "Serviços premium",
    });

    // Serviços
    const service1 = await ctx.runMutation("services:createService", {
      name: "Corte Masculino",
      description: "Corte de cabelo masculino completo",
      category: "Hair",
      durationMinutes: 30,
      price: 35.00,
    });

    const service2 = await ctx.runMutation("services:createService", {
      name: "Barba",
      description: "Aparação e modelagem da barba",
      category: "Beard",
      durationMinutes: 20,
      price: 25.00,
    });

    const service3 = await ctx.runMutation("services:createService", {
      name: "Cabelo + Barba",
      description: "Combo completo de cabelo e barba",
      category: "Combo",
      durationMinutes: 45,
      price: 55.00,
    });

    const service4 = await ctx.runMutation("services:createService", {
      name: "Tintura",
      description: "Coloração completa do cabelo",
      category: "Coloring",
      durationMinutes: 90,
      price: 120.00,
    });

    const service5 = await ctx.runMutation("services:createService", {
      name: "Sobrancelha",
      description: "Design e limpeza de sobrancelhas",
      category: "Hair",
      durationMinutes: 15,
      price: 15.00,
    });

    // Relacionamentos Profissionais-Serviços
    await ctx.runMutation("services:addServiceToProfessional", {
      professionalId: professional1,
      serviceId: service1,
    });
    await ctx.runMutation("services:addServiceToProfessional", {
      professionalId: professional1,
      serviceId: service2,
    });
    await ctx.runMutation("services:addServiceToProfessional", {
      professionalId: professional1,
      serviceId: service3,
    });
    await ctx.runMutation("services:addServiceToProfessional", {
      professionalId: professional1,
      serviceId: service4,
    });
    await ctx.runMutation("services:addServiceToProfessional", {
      professionalId: professional1,
      serviceId: service5,
    });

    await ctx.runMutation("services:addServiceToProfessional", {
      professionalId: professional2,
      serviceId: service1,
    });
    await ctx.runMutation("services:addServiceToProfessional", {
      professionalId: professional2,
      serviceId: service2,
    });
    await ctx.runMutation("services:addServiceToProfessional", {
      professionalId: professional2,
      serviceId: service3,
    });

    await ctx.runMutation("services:addServiceToProfessional", {
      professionalId: professional3,
      serviceId: service4,
    });
    await ctx.runMutation("services:addServiceToProfessional", {
      professionalId: professional3,
      serviceId: service5,
    });

    // Configurações do negócio
    await ctx.runMutation("services:upsertBusinessSettings", {
      businessName: "ServicePro Barbearia",
      address: "Rua das Flores, 123 - São Paulo, SP",
      phone: "+5511987654321",
      openingHours: {
        monday: "09:00-18:00",
        tuesday: "09:00-18:00",
        wednesday: "09:00-18:00",
        thursday: "09:00-18:00",
        friday: "09:00-19:00",
        saturday: "08:00-17:00",
        sunday: "closed",
      },
      timezone: "America/Sao_Paulo",
      notificationSettings: {},
    });

    return {
      message: "Database seeded successfully",
      professionals: [professional1, professional2, professional3],
      customers: [customer1, customer2, customer3, customer4, customer5],
      services: [service1, service2, service3, service4, service5],
    };
  },
});