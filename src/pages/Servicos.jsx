import { useState } from 'react'
import { useUser } from '@clerk/clerk-react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'

function Servicos() {
  const { user } = useUser()
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showPriceModal, setShowPriceModal] = useState(false)
  const [editingService, setEditingService] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: '',
    price: '',
    category: ''
  })

  // Queries
  const userProfile = useQuery(api.users.getUserProfile, user ? { clerkId: user.id } : "skip")
  const ownerId = userProfile?.linkedToOwnerId || user?.id
  const services = useQuery(api.services.getAll, ownerId ? { ownerId } : "skip")
  
  // Verificar se é dono (pode editar) ou funcionário (apenas visualizar)
  const isOwner = userProfile?.isOwner === true

  // Mutations
  const createService = useMutation(api.services.create)
  const updateService = useMutation(api.services.update)
  const deleteService = useMutation(api.services.remove)

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingService) {
        await updateService({
          id: editingService._id,
          ownerId,
          ...formData,
          duration: parseInt(formData.duration),
          price: parseFloat(formData.price)
        })
      } else {
        await createService({
          ownerId,
          ...formData,
          duration: parseInt(formData.duration),
          price: parseFloat(formData.price)
        })
      }
      setShowAddModal(false)
      setShowEditModal(false)
      setFormData({ name: '', description: '', duration: '', price: '', category: '' })
      setEditingService(null)
    } catch (error) {
      console.error('Erro ao salvar serviço:', error)
      alert('Erro ao salvar serviço')
    }
  }

  const handleEdit = (service) => {
    setEditingService(service)
    setFormData({
      name: service.name,
      description: service.description || '',
      duration: service.durationMinutes.toString(),
      price: service.price.toString(),
      category: service.category || ''
    })
    setShowEditModal(true)
  }

  const handleDelete = async (serviceId) => {
    if (confirm('Tem certeza que deseja excluir este serviço?')) {
      try {
        await deleteService({ id: serviceId, ownerId })
      } catch (error) {
        console.error('Erro ao excluir serviço:', error)
        alert('Erro ao excluir serviço')
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background-dark">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-text-main dark:text-white mb-2">
              Gestão de Serviços
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Gerencie seus serviços, preços e categorias
            </p>
          </div>

          {/* Cards de Ações Principais - Apenas para Donos */}
          {isOwner && (
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div 
                onClick={() => setShowAddModal(true)}
                className="bg-white dark:bg-surface-dark p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 hover:border-primary/50 transition-colors cursor-pointer"
              >
                <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl text-primary">add_circle</span>
                </div>
                <h3 className="text-xl font-semibold text-text-main dark:text-white mb-2 text-center">
                  Adicionar Serviço
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-center">
                  Adicione um novo serviço ao seu catálogo
                </p>
              </div>

              <div 
                onClick={() => setShowPriceModal(true)}
                className="bg-white dark:bg-surface-dark p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 hover:border-primary/50 transition-colors cursor-pointer"
              >
                <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl text-primary">attach_money</span>
                </div>
                <h3 className="text-xl font-semibold text-text-main dark:text-white mb-2 text-center">
                  Ajustar Preços
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-center">
                  Edite os preços dos serviços cadastrados
                </p>
              </div>
            </div>
          )}

          {/* Lista de Serviços */}
          <div className="bg-white dark:bg-surface-dark p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-text-main dark:text-white">
                Catálogo de Serviços
              </h2>
              {isOwner && (
                <button 
                  onClick={() => setShowAddModal(true)}
                  className="bg-primary hover:bg-primary-dark text-primary-content px-6 py-3 rounded-xl font-bold shadow-lg shadow-primary/25 transition-all duration-300 hover:shadow-xl hover:scale-105"
                >
                  + Novo Serviço
                </button>
              )}
            </div>

            {!services || services.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-4xl text-primary">inventory</span>
                </div>
                <h3 className="text-xl font-semibold text-text-main dark:text-white mb-2">
                  Nenhum serviço cadastrado
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  {isOwner 
                    ? 'Comece adicionando seu primeiro serviço para organizar seu negócio'
                    : 'Ainda não há serviços cadastrados neste estabelecimento'
                  }
                </p>
                {isOwner && (
                  <button 
                    onClick={() => setShowAddModal(true)}
                  className="bg-primary hover:bg-primary-dark text-primary-content px-8 py-3 rounded-xl font-bold shadow-lg shadow-primary/25 transition-all duration-300 hover:shadow-xl hover:scale-105"
                >
                  Adicionar Primeiro Serviço
                </button>
                )}
              </div>
            ) : (
              <div className="grid gap-4">
                {services.map((service) => (
                  <div key={service._id} className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary/30 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-text-main dark:text-white mb-2">{service.name}</h3>
                        {service.description && (
                          <p className="text-gray-600 dark:text-gray-300 mb-3">{service.description}</p>
                        )}
                        <div className="flex gap-6 text-sm">
                          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                            <span className="material-symbols-outlined text-base">schedule</span>
                            <span>{service.durationMinutes} min</span>
                          </div>
                          <div className="flex items-center gap-2 text-primary font-bold">
                            <span className="material-symbols-outlined text-base">payments</span>
                            <span>R$ {service.price.toFixed(2)}</span>
                          </div>
                          {service.category && (
                            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                              <span className="material-symbols-outlined text-base">category</span>
                              <span>{service.category}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      {isOwner && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(service)}
                            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <span className="material-symbols-outlined text-primary">edit</span>
                          </button>
                          <button
                            onClick={() => handleDelete(service._id)}
                            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            title="Excluir"
                          >
                            <span className="material-symbols-outlined text-red-400">delete</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Estatísticas */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-surface-dark p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 text-center">
              <div className="text-3xl font-bold text-primary mb-2">{services?.length || 0}</div>
              <div className="text-gray-600 dark:text-gray-300">Serviços Ativos</div>
            </div>
            <div className="bg-white dark:bg-surface-dark p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                R$ {services?.reduce((acc, s) => acc + s.price, 0).toFixed(2) || '0,00'}
              </div>
              <div className="text-gray-600 dark:text-gray-300">Valor Total dos Serviços</div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Adicionar Serviço */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-surface-dark rounded-2xl max-w-lg w-full p-8 border border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-6">Adicionar Novo Serviço</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">Nome do Serviço *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  placeholder="Ex: Corte de Cabelo"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Descrição</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  placeholder="Descrição opcional do serviço"
                  rows="3"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 mb-2">Duração (min) *</label>
                  <input
                    type="number"
                    required
                    min="5"
                    step="5"
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: e.target.value})}
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    placeholder="30"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">Preço (R$) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    placeholder="50.00"
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Categoria</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  placeholder="Ex: Cabelo, Barba, Tratamentos"
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false)
                    setFormData({ name: '', description: '', duration: '', price: '', category: '' })
                  }}
                  className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-primary hover:bg-primary-dark text-primary-content rounded-xl font-bold shadow-lg shadow-primary/25 transition-all"
                >
                  Adicionar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar Serviço */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-surface-dark rounded-2xl max-w-lg w-full p-8 border border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-6">Editar Serviço</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">Nome do Serviço *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Descrição</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  rows="3"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 mb-2">Duração (min) *</label>
                  <input
                    type="number"
                    required
                    min="5"
                    step="5"
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: e.target.value})}
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">Preço (R$) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Categoria</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false)
                    setEditingService(null)
                    setFormData({ name: '', description: '', duration: '', price: '', category: '' })
                  }}
                  className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-primary hover:bg-primary-dark text-primary-content rounded-xl font-bold shadow-lg shadow-primary/25 transition-all"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Ajustar Preços */}
      {showPriceModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-surface-dark rounded-2xl max-w-3xl w-full p-8 border border-gray-700 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Ajustar Preços</h2>
              <button
                onClick={() => setShowPriceModal(false)}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <span className="material-symbols-outlined text-gray-400">close</span>
              </button>
            </div>

            {!services || services.length === 0 ? (
              <div className="text-center py-12">
                <span className="material-symbols-outlined text-gray-600 text-5xl mb-4 block">inventory</span>
                <p className="text-gray-400">Nenhum serviço cadastrado ainda.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {services.map((service) => (
                  <div key={service._id} className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 flex justify-between items-center">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-1">{service.name}</h3>
                      <div className="flex gap-4 text-sm text-gray-400">
                        <span>{service.durationMinutes} min</span>
                        {service.category && <span>• {service.category}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm text-gray-400">Preço atual</div>
                        <div className="text-xl font-bold text-primary">R$ {service.price.toFixed(2)}</div>
                      </div>
                      <button
                        onClick={() => {
                          setEditingService(service)
                          setFormData({
                            name: service.name,
                            description: service.description || '',
                            duration: service.durationMinutes.toString(),
                            price: service.price.toString(),
                            category: service.category || ''
                          })
                          setShowPriceModal(false)
                          setTimeout(() => setShowEditModal(true), 100)
                        }}
                        className="px-4 py-2 bg-primary hover:bg-primary-dark text-primary-content rounded-lg font-medium transition-colors"
                      >
                        Alterar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6">
              <button
                onClick={() => setShowPriceModal(false)}
                className="w-full px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-medium transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Servicos

