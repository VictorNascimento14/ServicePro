import PageHeader from '../../components/PageHeader'
import { useUser, useClerk } from '@clerk/clerk-react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { useNavigate } from 'react-router-dom'

function ClienteDashboard() {
  const { user } = useUser()
  const { signOut } = useClerk()
  const navigate = useNavigate()
  const resetProfile = useMutation(api.users.resetUserProfile)
  const cancelAppointment = useMutation(api.appointments.cancelClientAppointment)
  const userProfile = useQuery(api.users.getUserProfile, user ? { clerkId: user.id } : "skip")
  const userName = userProfile?.userName || user?.firstName || 'Cliente'
  
  // Buscar agendamentos do cliente
  const clientAppointments = useQuery(
    api.appointments.getByClientClerkId, 
    user ? { clientClerkId: user.id } : "skip"
  )
  
  const handleCancelAppointment = async (appointmentId, date, time) => {
    if (confirm(`Tem certeza que deseja cancelar o agendamento do dia ${date} às ${time}?`)) {
      try {
        await cancelAppointment({ appointmentId })
        alert('Agendamento cancelado com sucesso!')
      } catch (error) {
        console.error('Erro ao cancelar:', error)
        alert('Erro ao cancelar agendamento. Tente novamente.')
      }
    }
  }

  const resetButton = (
    <button
      onClick={async () => {
        if (confirm('Isso vai resetar seu perfil e você terá que refazer o onboarding. Continuar?')) {
          await resetProfile({ clerkId: user.id })
          window.location.reload()
        }
      }}
      className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium text-sm shadow-md transition-all"
    >
      <span className="material-symbols-outlined text-[16px]">refresh</span>
      <span>Resetar Perfil (Teste)</span>
    </button>
  )

  const signOutButton = (
    <button
      onClick={() => signOut()}
      className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium text-sm shadow-md transition-all"
    >
      <span className="material-symbols-outlined text-[16px]">logout</span>
      <span>Sair</span>
    </button>
  )

  return (
    <div className="space-y-6">
      <PageHeader 
        title={`Olá, ${userName}! 👋`} 
        subtitle="Bem-vindo ao ServicePro"
        actions={
          <div className="flex gap-3">
            {resetButton}
            {signOutButton}
          </div>
        }
      />
      
      {/* Cards de ações rápidas */}
      <div className="grid md:grid-cols-3 gap-6">
        <div 
          onClick={() => navigate('/agendar')}
          className="bg-white dark:bg-surface-dark rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-800 hover:border-primary dark:hover:border-primary transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-2xl">event</span>
            </div>
            <div>
              <h3 className="font-semibold text-text-main dark:text-white">Agendar Horário</h3>
              <p className="text-sm text-text-muted dark:text-gray-400">Marque seu próximo corte</p>
            </div>
          </div>
        </div>

        <div 
          onClick={() => navigate('/historico')}
          className="bg-white dark:bg-surface-dark rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-800 hover:border-primary dark:hover:border-primary transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-2xl">history</span>
            </div>
            <div>
              <h3 className="font-semibold text-text-main dark:text-white">Meu Histórico</h3>
              <p className="text-sm text-text-muted dark:text-gray-400">Veja seus cortes anteriores</p>
            </div>
          </div>
        </div>

        <div 
          onClick={() => navigate('/barbearias')}
          className="bg-white dark:bg-surface-dark rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-800 hover:border-primary dark:hover:border-primary transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-2xl">store</span>
            </div>
            <div>
              <h3 className="font-semibold text-text-main dark:text-white">Barbearias</h3>
              <p className="text-sm text-text-muted dark:text-gray-400">Descubra novos lugares</p>
            </div>
          </div>
        </div>
      </div>

      {/* Próximos agendamentos */}
      <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-800">
        <h2 className="text-lg font-semibold text-text-main dark:text-white mb-4">
          Meus Agendamentos
        </h2>
        
        {!clientAppointments ? (
          <div className="text-center py-8">
            <span className="material-symbols-outlined text-gray-300 dark:text-gray-600 text-5xl mb-4 block animate-spin">sync</span>
            <p className="text-text-muted dark:text-gray-400">Carregando...</p>
          </div>
        ) : clientAppointments.length === 0 ? (
          <div className="text-center py-8">
            <span className="material-symbols-outlined text-gray-300 dark:text-gray-600 text-5xl mb-4 block">event_busy</span>
            <p className="text-text-muted dark:text-gray-400">Nenhum agendamento encontrado</p>
            <p className="text-sm text-text-muted dark:text-gray-500 mt-2">
              Agende seu próximo corte para garantir seu horário!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {clientAppointments.map((appointment) => (
              <div 
                key={appointment._id}
                className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-2xl">event</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-main dark:text-white">
                      {appointment.serviceName || 'Serviço'}
                    </h3>
                    <div className="flex items-center gap-4 mt-1 text-sm text-text-muted dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                        {appointment.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">schedule</span>
                        {appointment.time}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">person</span>
                        {appointment.professionalName || 'Profissional'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      appointment.status === 'confirmed' 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                        : appointment.status === 'cancelled'
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-400'
                    }`}>
                      {appointment.status === 'confirmed' ? 'Confirmado' : 
                       appointment.status === 'cancelled' ? 'Cancelado' : 
                       appointment.status === 'completed' ? 'Concluído' : appointment.status}
                    </div>
                    <p className="text-sm font-semibold text-primary mt-2">
                      R$ {(appointment.totalValue || 0).toFixed(2)}
                    </p>
                  </div>
                  {appointment.status === 'confirmed' && (
                    <button
                      onClick={() => handleCancelAppointment(appointment._id, appointment.date, appointment.time)}
                      className="flex items-center gap-1 px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs font-medium transition-colors"
                    >
                      <span className="material-symbols-outlined text-[14px]">close</span>
                      Cancelar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ClienteDashboard
