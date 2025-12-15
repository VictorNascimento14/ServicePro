import PageHeader from '../components/PageHeader'
import { useUser } from '@clerk/clerk-react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useState } from 'react'

function Solicitacoes() {
  const { user } = useUser()
  const [processing, setProcessing] = useState(null)
  
  // Buscar perfil do usuário
  const userProfile = useQuery(api.users.getUserProfile, user ? { clerkId: user.id } : "skip")
  
  // Buscar agendamentos pendentes do profissional
  const allAppointments = useQuery(
    api.appointments.getByProfessionalClerkId,
    user ? { professionalClerkId: user.id } : "skip"
  )
  
  // Filtrar apenas os pendentes
  const pendingAppointments = allAppointments?.filter(apt => apt.status === 'pending') || []
  
  // Mutations
  const updateStatus = useMutation(api.appointments.updateStatus)
  
  // Verificar se aprovação automática está ativada
  const autoApproveEnabled = userProfile?.autoApproveClients === true
  
  console.log('userProfile:', userProfile)
  console.log('autoApproveClients:', userProfile?.autoApproveClients)
  console.log('autoApproveEnabled:', autoApproveEnabled)
  
  const handleApprove = async (appointmentId, ownerId) => {
    setProcessing(appointmentId)
    try {
      await updateStatus({ 
        id: appointmentId, 
        ownerId: ownerId,
        status: 'confirmed'
      })
    } catch (error) {
      console.error('Erro ao aprovar:', error)
    } finally {
      setProcessing(null)
    }
  }
  
  const handleReject = async (appointmentId, ownerId) => {
    setProcessing(appointmentId)
    try {
      await updateStatus({ 
        id: appointmentId, 
        ownerId: ownerId,
        status: 'cancelled'
      })
    } catch (error) {
      console.error('Erro ao recusar:', error)
    } finally {
      setProcessing(null)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Solicitações" 
        subtitle="Gerencie os agendamentos que aguardam sua aprovação"
      />

      {autoApproveEnabled ? (
        // Mensagem quando aprovação automática está ativada
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-8 border border-blue-200 dark:border-blue-800">
          <div className="flex flex-col items-center gap-4 text-center">
            <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-6xl">info</span>
            <div>
              <h3 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-3">Aprovação Automática Ativada</h3>
              <p className="text-blue-800 dark:text-blue-300 mb-4 max-w-2xl">
                Com a aprovação automática ativada, não há solicitações pendentes para revisar. 
                Todos os agendamentos são confirmados instantaneamente.
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-400">
                Para gerenciar solicitações manualmente, desative a opção <strong>"Aprovação Automática de Clientes"</strong> em Configurações.
              </p>
            </div>
          </div>
        </div>
      ) : (
        // Lista de solicitações quando aprovação manual está ativa
        <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-text-main dark:text-white mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">pending_actions</span>
            Agendamentos Pendentes
          </h2>

          {!allAppointments ? (
            <p className="text-text-muted dark:text-gray-400">Carregando...</p>
          ) : pendingAppointments.length === 0 ? (
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-gray-300 dark:text-gray-600 text-6xl mb-4 block">check_circle</span>
              <p className="text-gray-500 dark:text-gray-400 text-lg">Nenhuma solicitação pendente</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">Todos os agendamentos foram revisados</p>
            </div>
          ) : (
          <div className="space-y-4">
            {pendingAppointments.map((appointment) => (
              <div 
                key={appointment._id} 
                className="bg-white dark:bg-surface-dark rounded-xl p-6 shadow-sm border-l-4 border-orange-500 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="material-symbols-outlined text-orange-500 text-3xl">pending_actions</span>
                      <div>
                        <h3 className="font-bold text-lg text-text-main dark:text-white">
                          {appointment.service?.name || 'Serviço'}
                        </h3>
                        <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">
                          Aguardando aprovação
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                      <div className="space-y-2">
                        <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                          <span className="material-symbols-outlined text-sm">person</span>
                          <strong>Cliente:</strong> {appointment.clientName}
                        </p>
                        {appointment.clientPhone && (
                          <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">phone</span>
                            {appointment.clientPhone}
                          </p>
                        )}
                        {appointment.clientEmail && (
                          <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">email</span>
                            {appointment.clientEmail}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                          <span className="material-symbols-outlined text-sm">calendar_today</span>
                          <strong>Data:</strong> {appointment.dayOfWeek}, {appointment.date}
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                          <span className="material-symbols-outlined text-sm">schedule</span>
                          <strong>Horário:</strong> {appointment.time}
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                          <span className="material-symbols-outlined text-sm">payments</span>
                          <strong>Valor:</strong> 
                          <span className="text-lg font-bold text-primary ml-1">
                            R$ {appointment.totalValue?.toFixed(2) || '0,00'}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleApprove(appointment._id, appointment.ownerId)}
                      disabled={processing === appointment._id}
                      className="px-6 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md"
                    >
                      <span className="material-symbols-outlined text-sm">check</span>
                      Aceitar
                    </button>
                    <button
                      onClick={() => handleReject(appointment._id, appointment.ownerId)}
                      disabled={processing === appointment._id}
                      className="px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md"
                    >
                      <span className="material-symbols-outlined text-sm">close</span>
                      Recusar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Solicitacoes
