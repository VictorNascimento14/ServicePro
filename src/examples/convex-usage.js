// Exemplos de uso das funções Convex no frontend React

import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

// Buscar todos os profissionais ativos
export function useActiveProfessionals() {
  return useQuery(api.users.getActiveProfessionals);
}

// Buscar agendamentos de um profissional em uma data específica
export function useProfessionalAppointments(professionalId, startDate, endDate) {
  return useQuery(api.appointments.getByProfessional, {
    professionalId,
    startDate,
    endDate,
  });
}

// Criar um novo agendamento
export function useCreateAppointment() {
  return useMutation(api.appointments.create);
}

// Exemplo de componente usando as funções
export function AppointmentForm({ customerId, professionalId, serviceId }) {
  const createAppointment = useCreateAppointment();
  const services = useQuery(api.services.getActiveServices);

  const handleSubmit = async (formData) => {
    try {
      const startTime = new Date(formData.date + " " + formData.time).getTime();
      const selectedService = services?.find(s => s._id === serviceId);
      const endTime = startTime + (selectedService?.durationMinutes * 60 * 1000);

      await createAppointment({
        startDatetime: startTime,
        endDatetime: endTime,
        customerId,
        professionalId,
        serviceId,
        notes: formData.notes,
        totalValue: selectedService?.price || 0,
      });

      alert("Agendamento criado com sucesso!");
    } catch (error) {
      alert("Erro ao criar agendamento: " + error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
}

// Buscar configurações do negócio
export function useBusinessSettings() {
  return useQuery(api.services.getBusinessSettings);
}

// Dashboard com métricas
export function Dashboard() {
  const settings = useBusinessSettings();
  const professionals = useActiveProfessionals();
  const todayAppointments = useQuery(api.appointments.getByDate, {
    date: new Date().toISOString().split('T')[0]
  });

  return (
    <div>
      <h1>{settings?.businessName || "ServicePro"}</h1>
      <p>Profissionais: {professionals?.length || 0}</p>
      <p>Agendamentos hoje: {todayAppointments?.length || 0}</p>
    </div>
  );
}