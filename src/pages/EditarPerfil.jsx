import PageHeader from '../components/PageHeader'
import { useState, useEffect } from 'react'
import { useUser } from '@clerk/clerk-react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useNavigate } from 'react-router-dom'

function EditarPerfil() {
  const { user } = useUser()
  const navigate = useNavigate()
  const userProfile = useQuery(api.users.getUserProfile, user ? { clerkId: user.id } : "skip")
  const updateProfile = useMutation(api.users.updateUserProfile)
  
  const [formData, setFormData] = useState({
    userName: '',
    businessName: '',
    location: '',
    address: '',
    phone: ''
  })
  
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (userProfile) {
      setFormData({
        userName: userProfile.userName || '',
        businessName: userProfile.businessName || '',
        location: userProfile.location || '',
        address: userProfile.address || '',
        phone: userProfile.phone || ''
      })
    }
  }, [userProfile])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSaving(true)
    setMessage('')

    try {
      await updateProfile({
        clerkId: user.id,
        userName: formData.userName || undefined,
        userType: userProfile.userType,
        businessName: formData.businessName || undefined,
        services: userProfile.services || [],
        experience: userProfile.experience || undefined,
        location: formData.location || undefined,
        address: formData.address || undefined,
        phone: formData.phone || undefined,
        preferences: userProfile.preferences || [],
        availability: userProfile.availability || undefined,
        onboardingCompleted: true
      })

      setMessage('Perfil atualizado com sucesso!')
      setTimeout(() => {
        navigate('/')
      }, 1500)
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error)
      setMessage('Erro ao atualizar perfil. Tente novamente.')
    } finally {
      setIsSaving(false)
    }
  }

  const isBusiness = userProfile?.userType === 'barber' || userProfile?.userType === 'business'

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Editar Perfil" 
        subtitle="Atualize suas informações pessoais"
      />

      <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-800">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nome */}
          <div>
            <label className="block text-sm font-medium text-text-main dark:text-white mb-2">
              Como você quer ser chamado?
            </label>
            <input
              type="text"
              name="userName"
              value={formData.userName}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-text-main dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Seu nome"
            />
          </div>

          {/* Nome da Barbearia (só para business/barber) */}
          {isBusiness && (
            <div>
              <label className="block text-sm font-medium text-text-main dark:text-white mb-2">
                Nome da Barbearia
              </label>
              <input
                type="text"
                name="businessName"
                value={formData.businessName}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-text-main dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Nome do seu estabelecimento"
              />
            </div>
          )}

          {/* Cidade */}
          <div>
            <label className="block text-sm font-medium text-text-main dark:text-white mb-2">
              Cidade
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-text-main dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Ex: São Paulo, SP"
            />
          </div>

          {/* Endereço Completo (só para business/barber) */}
          {isBusiness && (
            <div>
              <label className="block text-sm font-medium text-text-main dark:text-white mb-2">
                Endereço Completo
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-text-main dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Rua, número, bairro"
              />
              <p className="text-xs text-text-muted dark:text-gray-400 mt-1">
                Este endereço será exibido para clientes encontrarem sua barbearia
              </p>
            </div>
          )}

          {/* Telefone */}
          <div>
            <label className="block text-sm font-medium text-text-main dark:text-white mb-2">
              Telefone
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-text-main dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="(11) 99999-9999"
            />
          </div>

          {/* Mensagem de feedback */}
          {message && (
            <div className={`p-4 rounded-lg ${message.includes('sucesso') ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'}`}>
              {message}
            </div>
          )}

          {/* Botões */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-text-main dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>

      {/* Card de informações do Clerk */}
      <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-800">
        <h3 className="text-lg font-semibold text-text-main dark:text-white mb-4">
          Segurança da Conta
        </h3>
        <p className="text-sm text-text-muted dark:text-gray-400 mb-4">
          Para alterar seu email ou senha, use o painel de segurança do Clerk
        </p>
        <button
          onClick={() => window.open('https://accounts.clerk.dev/user', '_blank')}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-text-main dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-sm">lock</span>
          Gerenciar Segurança
        </button>
      </div>
    </div>
  )
}

export default EditarPerfil
