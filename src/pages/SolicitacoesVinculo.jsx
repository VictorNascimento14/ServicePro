import PageHeader from '../components/PageHeader'
import { useUser } from '@clerk/clerk-react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useState } from 'react'

function SolicitacoesVinculo() {
  const { user } = useUser()
  const pendingRequests = useQuery(api.linkRequests.getPendingRequests, user ? { ownerId: user.id } : "skip")
  const linkedEmployees = useQuery(api.linkRequests.getLinkedEmployees, user ? { ownerId: user.id } : "skip")
  const acceptRequest = useMutation(api.linkRequests.acceptLinkRequest)
  const rejectRequest = useMutation(api.linkRequests.rejectLinkRequest)
  
  const [processing, setProcessing] = useState(null)

  const handleAccept = async (requestId) => {
    setProcessing(requestId)
    try {
      await acceptRequest({ requestId })
    } catch (error) {
      console.error('Erro ao aceitar solicitação:', error)
    } finally {
      setProcessing(null)
    }
  }

  const handleReject = async (requestId) => {
    setProcessing(requestId)
    try {
      await rejectRequest({ requestId })
    } catch (error) {
      console.error('Erro ao rejeitar solicitação:', error)
    } finally {
      setProcessing(null)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Solicitações de Vínculo" 
        subtitle="Gerencie os funcionários que desejam trabalhar em sua barbearia"
      />

      {/* Solicitações Pendentes */}
      <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-800">
        <h2 className="text-lg font-semibold text-text-main dark:text-white mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">pending</span>
          Solicitações Pendentes
        </h2>

        {pendingRequests === undefined ? (
          <p className="text-text-muted dark:text-gray-400">Carregando...</p>
        ) : pendingRequests.length === 0 ? (
          <div className="text-center py-8">
            <span className="material-symbols-outlined text-gray-300 dark:text-gray-600 text-5xl mb-4 block">inbox</span>
            <p className="text-text-muted dark:text-gray-400">Nenhuma solicitação pendente</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingRequests.map((request) => (
              <div
                key={request._id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-primary dark:hover:border-primary transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-text-main dark:text-white">{request.employeeName}</h3>
                    
                    {request.employeePhone && (
                      <p className="text-sm text-text-muted dark:text-gray-400 flex items-center gap-1 mt-1">
                        <span className="material-symbols-outlined text-xs">phone</span>
                        {request.employeePhone}
                      </p>
                    )}
                    
                    {request.employeeExperience && (
                      <p className="text-sm text-text-muted dark:text-gray-400 mt-1">
                        Experiência: {
                          request.employeeExperience === 'beginner' ? 'Menos de 1 ano' :
                          request.employeeExperience === 'intermediate' ? '1-3 anos' :
                          request.employeeExperience === 'experienced' ? '3-5 anos' :
                          request.employeeExperience === 'expert' ? 'Mais de 5 anos' : request.employeeExperience
                        }
                      </p>
                    )}
                    
                    {request.employeeServices && request.employeeServices.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-text-muted dark:text-gray-400 mb-1">Serviços:</p>
                        <div className="flex flex-wrap gap-1">
                          {request.employeeServices.map((service, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                            >
                              {service}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAccept(request._id)}
                      disabled={processing === request._id}
                      className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-sm">check</span>
                      Aceitar
                    </button>
                    <button
                      onClick={() => handleReject(request._id)}
                      disabled={processing === request._id}
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
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

      {/* Funcionários Vinculados */}
      <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-800">
        <h2 className="text-lg font-semibold text-text-main dark:text-white mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">group</span>
          Funcionários Vinculados
        </h2>

        {linkedEmployees === undefined ? (
          <p className="text-text-muted dark:text-gray-400">Carregando...</p>
        ) : linkedEmployees.length === 0 ? (
          <div className="text-center py-8">
            <span className="material-symbols-outlined text-gray-300 dark:text-gray-600 text-5xl mb-4 block">person_off</span>
            <p className="text-text-muted dark:text-gray-400">Nenhum funcionário vinculado ainda</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {linkedEmployees.map((employee) => (
              <div
                key={employee._id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
              >
                <h3 className="font-semibold text-text-main dark:text-white">{employee.userName}</h3>
                {employee.phone && (
                  <p className="text-sm text-text-muted dark:text-gray-400 flex items-center gap-1 mt-1">
                    <span className="material-symbols-outlined text-xs">phone</span>
                    {employee.phone}
                  </p>
                )}
                <div className="mt-2 flex items-center gap-2">
                  <span className="px-2 py-1 bg-green-500/10 text-green-500 text-xs rounded-full">
                    Ativo
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default SolicitacoesVinculo
