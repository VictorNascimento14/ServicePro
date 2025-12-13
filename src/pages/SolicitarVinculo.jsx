import { useState } from 'react'
import { useUser, useClerk } from '@clerk/clerk-react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useNavigate } from 'react-router-dom'

function SolicitarVinculo() {
  const { user } = useUser()
  const { signOut } = useClerk()
  const navigate = useNavigate()
  const [selectedBusiness, setSelectedBusiness] = useState(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const [message, setMessage] = useState('')
  
  const businesses = useQuery(api.linkRequests.getAvailableBusinesses)
  const userProfile = useQuery(api.users.getUserProfile, user ? { clerkId: user.id } : "skip")
  const createRequest = useMutation(api.linkRequests.createLinkRequest)
  const pendingRequest = useQuery(api.linkRequests.getEmployeeRequest, user ? { employeeId: user.id } : "skip")

  const handleSubmit = async () => {
    if (!selectedBusiness || !userProfile) return

    try {
      await createRequest({
        employeeId: user.id,
        ownerId: selectedBusiness.clerkId,
        employeeName: userProfile.userName || user.firstName || 'Funcionário',
        employeePhone: userProfile.phone,
        employeeExperience: userProfile.experience,
        employeeServices: userProfile.services || [],
      })

      setMessage('Solicitação enviada com sucesso! Aguarde a aprovação do estabelecimento.')
      setShowConfirm(false)
      setSelectedBusiness(null)
    } catch (error) {
      setMessage(error.message || 'Erro ao enviar solicitação')
    }
  }

  if (pendingRequest) {
    // Já existe uma solicitação pendente
    const businessName = businesses?.find(b => b.clerkId === pendingRequest.ownerId)?.businessName || 'Barbearia'
    
    return (
      <div className="min-h-screen bg-green-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-surface-dark p-8 rounded-2xl shadow-xl border border-gray-700">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-500/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-4xl text-yellow-500">schedule</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Aguardando Aprovação</h2>
            <p className="text-gray-300 mb-4">
              Sua solicitação para trabalhar em <strong>{businessName}</strong> está pendente.
            </p>
            <p className="text-sm text-gray-400 mb-6">
              Assim que o estabelecimento aprovar sua solicitação, você terá acesso completo à plataforma.
            </p>
            
            <button
              onClick={() => signOut(() => navigate('/'))}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-medium transition-colors"
            >
              Voltar ao Início
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-green-950 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary flex items-center justify-center shadow-lg">
            <span className="material-symbols-outlined text-3xl text-primary-content">handshake</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Solicitar Vínculo</h1>
          <p className="text-gray-300">Escolha a barbearia onde você deseja trabalhar</p>
        </div>

        {/* Mensagem de feedback */}
        {message && (
          <div className="mb-6 p-4 rounded-lg bg-green-500/20 text-green-400 border border-green-500/50">
            {message}
          </div>
        )}

        {/* Lista de barbearias */}
        <div className="grid md:grid-cols-2 gap-6">
          {businesses === undefined ? (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-400">Carregando barbearias...</p>
            </div>
          ) : businesses.length === 0 ? (
            <div className="col-span-full bg-surface-dark p-8 rounded-xl border border-gray-700 text-center">
              <span className="material-symbols-outlined text-gray-600 text-5xl mb-4 block">store</span>
              <h3 className="text-lg font-semibold text-white mb-2">Nenhuma barbearia disponível</h3>
              <p className="text-gray-400">Ainda não há estabelecimentos cadastrados.</p>
            </div>
          ) : (
            businesses.map((business) => (
              <div
                key={business._id}
                onClick={() => setSelectedBusiness(business)}
                className={`bg-surface-dark p-6 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedBusiness?._id === business._id
                    ? 'border-primary shadow-lg shadow-primary/25'
                    : 'border-gray-700 hover:border-gray-600'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-primary text-2xl">store</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-1">{business.businessName || 'Barbearia'}</h3>
                    {business.location && (
                      <p className="text-sm text-gray-400 flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">location_on</span>
                        {business.location}
                      </p>
                    )}
                    {business.phone && (
                      <p className="text-sm text-gray-400 flex items-center gap-1 mt-1">
                        <span className="material-symbols-outlined text-xs">phone</span>
                        {business.phone}
                      </p>
                    )}
                  </div>
                  {selectedBusiness?._id === business._id && (
                    <span className="material-symbols-outlined text-primary">check_circle</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Botão de enviar */}
        {selectedBusiness && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => setShowConfirm(true)}
              className="px-8 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold shadow-lg shadow-primary/25 transition-all duration-300 hover:shadow-xl hover:scale-105"
            >
              Enviar Solicitação
            </button>
          </div>
        )}

        {/* Modal de confirmação */}
        {showConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-surface-dark p-6 rounded-xl border border-gray-700 max-w-md w-full">
              <h3 className="text-xl font-bold text-white mb-4">Confirmar Solicitação</h3>
              <p className="text-gray-300 mb-6">
                Você está solicitando vínculo com <strong>{selectedBusiness.businessName}</strong>.
                Aguarde a aprovação do estabelecimento para ter acesso à plataforma.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 px-4 py-2 border border-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium transition-colors"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SolicitarVinculo
