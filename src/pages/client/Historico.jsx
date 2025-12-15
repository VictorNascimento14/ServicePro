import PageHeader from '../../components/PageHeader'
import { useUser } from '@clerk/clerk-react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { useState } from 'react'

function Historico() {
  const { user } = useUser()
  const [selectedIds, setSelectedIds] = useState([])
  const [showCompleted, setShowCompleted] = useState(true)
  const [showCancelled, setShowCancelled] = useState(true)
  
  const appointments = useQuery(
    api.appointments.getByClientClerkId,
    user ? { clientClerkId: user.id } : "skip"
  )
  
  const clearAppointments = useMutation(api.appointments.clearCompletedAppointments)
  
  // Filtrar apenas concluídos e cancelados
  const completedAndCancelled = appointments?.filter(
    app => {
      if (app.status === 'completed' && showCompleted) return true
      if (app.status === 'cancelled' && showCancelled) return true
      return false
    }
  ) || []
  
  const handleToggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }
  
  const handleSelectAll = () => {
    if (selectedIds.length === completedAndCancelled.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(completedAndCancelled.map(app => app._id))
    }
  }
  
  const handleClearSelected = async () => {
    if (selectedIds.length === 0) return
    
    if (!confirm(`Tem certeza que deseja remover ${selectedIds.length} agendamento(s) do seu histórico?`)) {
      return
    }
    
    try {
      await clearAppointments({
        clientClerkId: user.id,
        appointmentIds: selectedIds
      })
      setSelectedIds([])
    } catch (error) {
      alert('Erro ao limpar agendamentos: ' + error.message)
    }
  }
  
  const getStatusBadge = (status) => {
    const styles = {
      completed: 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400',
      cancelled: 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400',
      confirmed: 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400',
      pending: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400',
    }
    
    const labels = {
      completed: 'Concluído',
      cancelled: 'Cancelado',
      confirmed: 'Confirmado',
      pending: 'Pendente',
    }
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    )
  }
  
  return (
    <div className="space-y-6 p-6">
      <PageHeader title="Meu Histórico" subtitle="Veja e gerencie seus agendamentos passados" />
      
      {completedAndCancelled.length === 0 ? (
        <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-text-main dark:text-white mb-4">
            Nenhum histórico ainda
          </h2>
          <p className="text-text-muted dark:text-gray-400">
            Quando você concluir ou cancelar agendamentos, eles aparecerão aqui!
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
          {/* Header com ações */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={handleSelectAll}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <span className="material-symbols-outlined text-sm">
                  {selectedIds.length === completedAndCancelled.length ? 'check_box' : 'check_box_outline_blank'}
                </span>
                <span className="text-sm font-medium text-text-main dark:text-white">
                  {selectedIds.length === completedAndCancelled.length ? 'Desmarcar todos' : 'Selecionar todos'}
                </span>
              </button>
              
              {selectedIds.length > 0 && (
                <span className="text-sm text-text-muted dark:text-gray-400">
                  {selectedIds.length} selecionado(s)
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              {/* Filtros */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowCompleted(!showCompleted)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    showCompleted 
                      ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400' 
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-500'
                  }`}
                >
                  Concluídos
                </button>
                <button
                  onClick={() => setShowCancelled(!showCancelled)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    showCancelled 
                      ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400' 
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-500'
                  }`}
                >
                  Cancelados
                </button>
              </div>
              
              {selectedIds.length > 0 && (
                <button
                  onClick={handleClearSelected}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">delete</span>
                  <span className="text-sm font-medium">Limpar Selecionados</span>
                </button>
              )}
            </div>
          </div>
          
          {/* Lista de agendamentos */}
          <div className="divide-y divide-gray-200 dark:divide-gray-800">
            {completedAndCancelled.map((appointment) => (
              <div
                key={appointment._id}
                className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-start gap-4">
                  {/* Checkbox */}
                  <button
                    onClick={() => handleToggleSelect(appointment._id)}
                    className="mt-1"
                  >
                    <span className="material-symbols-outlined text-gray-400 hover:text-primary transition-colors">
                      {selectedIds.includes(appointment._id) ? 'check_box' : 'check_box_outline_blank'}
                    </span>
                  </button>
                  
                  {/* Conteúdo */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <h3 className="font-semibold text-text-main dark:text-white">
                          {appointment.service?.name || 'Serviço'}
                        </h3>
                        <p className="text-sm text-text-muted dark:text-gray-400 mt-1">
                          {appointment.owner?.businessName || 'Estabelecimento'}
                        </p>
                        <p className="text-sm text-text-muted dark:text-gray-400">
                          Profissional: {appointment.professional?.userName || 'N/A'}
                        </p>
                      </div>
                      {getStatusBadge(appointment.status)}
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-text-muted dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">calendar_today</span>
                        <span>{appointment.date}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">schedule</span>
                        <span>{appointment.time}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">payments</span>
                        <span>R$ {appointment.totalValue?.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Historico
