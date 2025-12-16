import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import { useUser } from '@clerk/clerk-react'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'

function Clientes() {
  const { user } = useUser()
  
  // Buscar perfil do usuário para obter ownerId
  const userProfile = useQuery(api.users.getUserProfile, user ? { clerkId: user.id } : "skip")
  const ownerId = userProfile?.linkedToOwnerId || user?.id
  
  // Buscar todos os clientes ativos
  const customers = useQuery(api.users.getActiveCustomers, ownerId ? { ownerId } : "skip")

  return (
    <>
      <PageHeader title="Clientes" subtitle="Gerencie sua base de clientes" />
      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-text-main dark:text-white">Lista de Clientes</h2>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <span className="material-symbols-outlined text-lg">group</span>
              <span>{customers?.length || 0} clientes</span>
            </div>
          </div>

          {!customers ? (
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-gray-300 dark:text-gray-600 text-5xl mb-4 block animate-spin">sync</span>
              <p className="text-gray-600 dark:text-gray-300">Carregando clientes...</p>
            </div>
          ) : customers.length === 0 ? (
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-gray-300 dark:text-gray-600 text-6xl mb-4 block">group_off</span>
              <h3 className="text-xl font-semibold text-text-main dark:text-white mb-2">
                Nenhum cliente cadastrado
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Os clientes serão adicionados automaticamente quando fizerem agendamentos
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {customers.map((customer) => (
                <div
                  key={customer._id}
                  className="border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:border-primary dark:hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4 flex-1">
                      <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-primary text-2xl">person</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-text-main dark:text-white mb-2">
                          {customer.fullName}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                          {customer.email && (
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                              <span className="material-symbols-outlined text-base">email</span>
                              <span>{customer.email}</span>
                            </div>
                          )}
                          {customer.phone && (
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                              <span className="material-symbols-outlined text-base">phone</span>
                              <span>{customer.phone}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <span className="material-symbols-outlined text-base">event</span>
                            <span>{customer.totalVisits} visitas</span>
                          </div>
                        </div>
                        {customer.tags && customer.tags.length > 0 && (
                          <div className="flex gap-2 mt-3">
                            {customer.tags.map((tag, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <Link
                      to={`/clientes/${customer._id}`}
                      className="ml-4 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-lg">visibility</span>
                      <span className="hidden sm:inline">Ver detalhes</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default Clientes


