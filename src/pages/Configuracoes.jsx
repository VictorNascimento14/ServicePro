import PageHeader from '../components/PageHeader'
import { useUser } from '@clerk/clerk-react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useState, useEffect } from 'react'

function Configuracoes() {
  const { user } = useUser()
  const userProfile = useQuery(api.users.getUserProfile, user ? { clerkId: user.id } : "skip")
  const updateProfile = useMutation(api.users.updateUserProfile)
  
  const [autoApproveClients, setAutoApproveClients] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')

  // Sincronizar com o valor do banco
  useEffect(() => {
    if (userProfile?.autoApproveClients !== undefined) {
      setAutoApproveClients(userProfile.autoApproveClients)
    }
  }, [userProfile])

  const handleToggleAutoApprove = async (newValue) => {
    setAutoApproveClients(newValue)
    setIsSaving(true)
    setSaveMessage('')

    try {
      await updateProfile({
        clerkId: user.id,
        autoApproveClients: newValue
      })
      setSaveMessage('Configuração salva com sucesso!')
      setTimeout(() => setSaveMessage(''), 3000)
    } catch (error) {
      console.error('Erro ao salvar:', error)
      setSaveMessage('Erro ao salvar configuração')
      setAutoApproveClients(!newValue) // Reverter
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      <PageHeader title="Configurações" subtitle="Gerencie as configurações do sistema" />
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
        
        {/* Configurações de Agendamentos */}
        <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3 mb-4">
            <span className="material-symbols-outlined text-primary text-3xl">event_available</span>
            <div>
              <h2 className="text-xl font-bold text-text-main dark:text-white">Agendamentos</h2>
              <p className="text-sm text-text-muted dark:text-gray-400">Configure como os agendamentos funcionam</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Toggle de Aprovação Automática */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-text-main dark:text-white">Aprovação Automática de Clientes</h3>
                  {isSaving && (
                    <span className="text-xs text-primary animate-pulse">Salvando...</span>
                  )}
                </div>
                <p className="text-sm text-text-muted dark:text-gray-400">
                  {autoApproveClients 
                    ? 'Clientes são automaticamente confirmados ao agendar' 
                    : 'Você precisa aprovar cada agendamento manualmente'}
                </p>
                {saveMessage && (
                  <p className={`text-xs mt-2 ${saveMessage.includes('sucesso') ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {saveMessage}
                  </p>
                )}
              </div>
              
              <button
                onClick={() => handleToggleAutoApprove(!autoApproveClients)}
                disabled={isSaving}
                className={`relative w-14 h-7 rounded-full transition-all duration-300 ${
                  autoApproveClients 
                    ? 'bg-primary' 
                    : 'bg-gray-300 dark:bg-gray-600'
                } ${isSaving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full transition-transform duration-300 shadow-md ${
                    autoApproveClients ? 'translate-x-7' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Informação adicional */}
            <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
              <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-xl mt-0.5">info</span>
              <div className="text-sm text-blue-800 dark:text-blue-300">
                <p className="font-semibold mb-1">Como funciona?</p>
                <ul className="list-disc list-inside space-y-1 text-blue-700 dark:text-blue-400">
                  <li><strong>Ativado:</strong> Agendamentos são confirmados instantaneamente</li>
                  <li><strong>Desativado:</strong> Agendamentos ficam como "pendente" até você aprovar</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Outras Configurações */}
        <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3 mb-4">
            <span className="material-symbols-outlined text-primary text-3xl">settings</span>
            <div>
              <h2 className="text-xl font-bold text-text-main dark:text-white">Outras Configurações</h2>
              <p className="text-sm text-text-muted dark:text-gray-400">Em breve mais opções estarão disponíveis</p>
            </div>
          </div>
          <p className="text-text-muted dark:text-gray-400 text-center py-8">Mais configurações em desenvolvimento...</p>
        </div>
      </div>
    </>
  )
}

export default Configuracoes

