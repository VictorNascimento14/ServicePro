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
  const userProfile = useQuery(api.users.getUserProfile, user ? { clerkId: user.id } : "skip")
  const userName = userProfile?.userName || user?.firstName || 'Cliente'

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

      {/* Próximo agendamento */}
      <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-800">
        <h2 className="text-lg font-semibold text-text-main dark:text-white mb-4">
          Próximo Agendamento
        </h2>
        <div className="text-center py-8">
          <span className="material-symbols-outlined text-gray-300 dark:text-gray-600 text-5xl mb-4 block">event_busy</span>
          <p className="text-text-muted dark:text-gray-400">Nenhum agendamento próximo</p>
          <p className="text-sm text-text-muted dark:text-gray-500 mt-2">
            Agende seu próximo corte para garantir seu horário!
          </p>
        </div>
      </div>
    </div>
  )
}

export default ClienteDashboard
