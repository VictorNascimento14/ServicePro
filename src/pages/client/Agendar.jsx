import PageHeader from '../../components/PageHeader'
import { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { useUser } from '@clerk/clerk-react'

function Agendar() {
  const { user } = useUser()
  const [cityFilter, setCityFilter] = useState('')
  const [selectedBarbearia, setSelectedBarbearia] = useState(null)
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false)
  const [selectedProfessional, setSelectedProfessional] = useState(null)
  const [currentDateIndex, setCurrentDateIndex] = useState(0)
  const [selectedTime, setSelectedTime] = useState(null)
  const [selectedService, setSelectedService] = useState(null)
  const [showServiceModal, setShowServiceModal] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  
  const barbearias = useQuery(api.users.getBarbearias, { city: cityFilter })
  const userProfile = useQuery(api.users.getUserProfile, user ? { clerkId: user.id } : "skip")
  
  // Buscar funcionários da barbearia selecionada
  const employees = useQuery(
    api.linkRequests.getLinkedEmployees,
    selectedBarbearia ? { ownerId: selectedBarbearia.clerkId } : "skip"
  )
  
  // Buscar serviços do estabelecimento
  const services = useQuery(
    api.services.getAll,
    selectedBarbearia ? { ownerId: selectedBarbearia.clerkId } : "skip"
  )

  // Mutation para criar agendamento
  const createAppointment = useMutation(api.appointments.createClientAppointment)
  
  // Horários padrão (08:00 - 20:00)
  const defaultHours = Array.from({ length: 13 }, (_, i) => {
    const hour = 8 + i
    return `${hour.toString().padStart(2, '0')}:00`
  })
  
  const weekDays = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

  // Gerar array de datas de hoje até 2100
  const generateDates = () => {
    const dates = []
    const today = new Date()
    const endDate = new Date(2100, 11, 31)
    
    let currentDate = new Date(today)
    
    while (currentDate <= endDate) {
      const dayOfWeek = weekDays[currentDate.getDay()]
      dates.push({
        date: new Date(currentDate),
        dayOfWeek,
        formatted: currentDate.toLocaleDateString('pt-BR')
      })
      currentDate.setDate(currentDate.getDate() + 1)
    }
    
    return dates
  }

  const allDates = generateDates()
  
  // Buscar disponibilidade do profissional selecionado considerando agendamentos
  const availability = useQuery(
    api.availability.getAvailabilityWithBookings,
    selectedProfessional && allDates[currentDateIndex] ? { 
      professionalClerkId: selectedProfessional.clerkId,
      date: allDates[currentDateIndex].formatted,
      dayOfWeek: allDates[currentDateIndex].dayOfWeek
    } : "skip"
  )

  const handleVerDisponibilidade = (barbearia) => {
    setSelectedBarbearia(barbearia)
    setSelectedProfessional(barbearia)
    setCurrentDateIndex(0)
    setShowAvailabilityModal(true)
  }

  const nextDay = () => {
    setCurrentDateIndex((prev) => Math.min(prev + 1, allDates.length - 1))
  }

  const prevDay = () => {
    setCurrentDateIndex((prev) => Math.max(prev - 1, 0))
  }

  const isHourAvailable = (hour) => {
    if (!availability) return true
    const found = availability.find(item => item.hour === hour)
    return found ? found.isAvailable : true
  }

  const getAvailableHoursByDay = () => {
    return defaultHours.filter(hour => isHourAvailable(hour))
  }

  const handleSelectTime = (time) => {
    setSelectedTime(time)
    setShowServiceModal(true)
  }

  const handleSelectService = (service) => {
    setSelectedService(service)
    setShowServiceModal(false)
    setShowConfirmModal(true)
  }

  const handleConfirmAppointment = async () => {
    if (!selectedService || !selectedTime || !selectedProfessional || !user || !userProfile) {
      console.log('❌ Dados incompletos para agendamento')
      return
    }

    console.log('🎯 Iniciando agendamento...')
    console.log('Dados do agendamento:', {
      ownerId: selectedBarbearia.clerkId,
      professionalClerkId: selectedProfessional.clerkId,
      clientClerkId: user.id,
      clientName: userProfile.userName || user.fullName || 'Cliente',
      clientEmail: user.emailAddresses?.[0]?.emailAddress,
      clientPhone: userProfile.phone,
    })

    try {
      console.log('📞 Chamando createAppointment...')
      const result = await createAppointment({
        ownerId: selectedBarbearia.clerkId,
        professionalClerkId: selectedProfessional.clerkId,
        clientClerkId: user.id,
        clientName: userProfile.userName || user.fullName || 'Cliente',
        clientEmail: user.emailAddresses?.[0]?.emailAddress,
        clientPhone: userProfile.phone,
        serviceId: selectedService._id,
        date: allDates[currentDateIndex].formatted,
        time: selectedTime,
        dayOfWeek: allDates[currentDateIndex].dayOfWeek,
        totalValue: selectedService.price,
      })
      
      console.log('✅ Agendamento criado com sucesso! ID:', result)

      setShowConfirmModal(false)
      setShowAvailabilityModal(false)
      setSelectedTime(null)
      setSelectedService(null)
      
      alert('Agendamento confirmado com sucesso!')
    } catch (error) {
      console.error('❌ Erro ao criar agendamento:', error)
      alert('Erro ao criar agendamento. Tente novamente.')
    }
  }

  return (
    <div className="space-y-6 p-6">
      <PageHeader title="Agendar Horário" subtitle="Reserve seu horário com seu barbeiro favorito" />
      
      {/* Filtro por cidade */}
      <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary">location_on</span>
          <input
            type="text"
            placeholder="Filtrar por cidade..."
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-text-main dark:text-white placeholder-gray-400"
          />
          {cityFilter && (
            <button
              onClick={() => setCityFilter('')}
              className="text-gray-400 hover:text-gray-600"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          )}
        </div>
      </div>

      {/* Lista de barbearias */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {barbearias === undefined ? (
          <div className="col-span-full text-center py-8">
            <p className="text-text-muted dark:text-gray-400">Carregando...</p>
          </div>
        ) : barbearias.length === 0 ? (
          <div className="col-span-full bg-white dark:bg-surface-dark rounded-xl shadow-sm p-8 border border-gray-200 dark:border-gray-800">
            <div className="text-center">
              <span className="material-symbols-outlined text-gray-300 dark:text-gray-600 text-5xl mb-4 block">store</span>
              <h3 className="text-lg font-semibold text-text-main dark:text-white mb-2">
                Nenhuma barbearia encontrada
              </h3>
              <p className="text-text-muted dark:text-gray-400">
                {cityFilter 
                  ? `Não encontramos barbearias em "${cityFilter}". Tente outra cidade.`
                  : 'Ainda não há barbearias cadastradas.'}
              </p>
            </div>
          </div>
        ) : (
          barbearias.map((barbearia) => (
            <div
              key={barbearia._id}
              className="bg-white dark:bg-surface-dark rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-800 hover:border-primary dark:hover:border-primary transition-all hover:shadow-lg"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-primary text-2xl">store</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-text-main dark:text-white truncate">
                    {barbearia.businessName || 'Barbearia'}
                  </h3>
                  <p className="text-sm text-text-muted dark:text-gray-400">
                    {barbearia.userType === 'business' ? 'Estabelecimento' : 'Profissional Autônomo'}
                  </p>
                </div>
              </div>

              {(barbearia.location || barbearia.address) && (
                <div className="mb-3 space-y-1">
                  {barbearia.location && (
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-gray-400 text-sm">location_city</span>
                      <span className="text-sm text-text-muted dark:text-gray-400">{barbearia.location}</span>
                    </div>
                  )}
                  {barbearia.address && (
                    <div className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-gray-400 text-sm">place</span>
                      <span className="text-sm text-text-muted dark:text-gray-400">{barbearia.address}</span>
                    </div>
                  )}
                </div>
              )}

              {barbearia.phone && (
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-gray-400 text-sm">phone</span>
                  <span className="text-sm text-text-muted dark:text-gray-400">{barbearia.phone}</span>
                </div>
              )}

              {barbearia.services && barbearia.services.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-text-muted dark:text-gray-400 mb-2">Serviços:</p>
                  <div className="flex flex-wrap gap-1">
                    {barbearia.services.slice(0, 3).map((service, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                      >
                        {service === 'haircut' ? 'Corte' :
                         service === 'beard' ? 'Barba' :
                         service === 'haircut-beard' ? 'Corte + Barba' :
                         service === 'hair-coloring' ? 'Coloração' :
                         service === 'hair-treatment' ? 'Tratamentos' : service}
                      </span>
                    ))}
                    {barbearia.services.length > 3 && (
                      <span className="px-2 py-1 text-text-muted dark:text-gray-400 text-xs">
                        +{barbearia.services.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {barbearia.experience && (
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-gray-400 text-sm">workspace_premium</span>
                  <span className="text-sm text-text-muted dark:text-gray-400">
                    {barbearia.experience === 'beginner' ? 'Menos de 1 ano' :
                     barbearia.experience === 'intermediate' ? '1-3 anos' :
                     barbearia.experience === 'experienced' ? '3-5 anos' :
                     barbearia.experience === 'expert' ? 'Mais de 5 anos' : barbearia.experience}
                  </span>
                </div>
              )}

              <button 
                onClick={() => handleVerDisponibilidade(barbearia)}
                className="w-full bg-primary hover:bg-primary-dark text-white py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">event</span>
                Ver Disponibilidade
              </button>
            </div>
          ))
        )}
      </div>

      {/* Modal de Disponibilidade */}
      {showAvailabilityModal && selectedBarbearia && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-surface-dark rounded-2xl max-w-4xl w-full p-8 border border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-text-main dark:text-white mb-2">
                  {selectedBarbearia.businessName || 'Barbearia'}
                </h2>
                <p className="text-text-muted dark:text-gray-400">
                  {selectedBarbearia.location}
                </p>
              </div>
              <button
                onClick={() => setShowAvailabilityModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <span className="material-symbols-outlined text-gray-400">close</span>
              </button>
            </div>

            {/* Seleção de Profissional */}
            <div className="mb-6">
              <h3 className="font-semibold text-text-main dark:text-white mb-3">
                Escolha o Profissional
              </h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedProfessional(selectedBarbearia)}
                  className={`px-4 py-2 rounded-lg border transition-all ${
                    selectedProfessional?.clerkId === selectedBarbearia.clerkId
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white dark:bg-gray-800 text-text-main dark:text-white border-gray-200 dark:border-gray-700 hover:border-primary'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">person</span>
                    <span>{selectedBarbearia.userName || 'Dono'}</span>
                    <span className="text-xs opacity-70">(Dono)</span>
                  </div>
                </button>

                {employees && employees.map((employee) => (
                  <button
                    key={employee._id}
                    onClick={() => setSelectedProfessional(employee)}
                    className={`px-4 py-2 rounded-lg border transition-all ${
                      selectedProfessional?.clerkId === employee.clerkId
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white dark:bg-gray-800 text-text-main dark:text-white border-gray-200 dark:border-gray-700 hover:border-primary'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">person</span>
                      <span>{employee.userName}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Agenda */}
            <div className="space-y-4">
              <h3 className="font-semibold text-text-main dark:text-white">
                Horários Disponíveis - {selectedProfessional?.userName || 'Profissional'}
              </h3>
              
              <div className="flex items-center justify-between bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 rounded-xl p-6 border-2 border-primary/30">
                <button
                  onClick={prevDay}
                  disabled={currentDateIndex === 0}
                  className="p-3 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-primary text-2xl">chevron_left</span>
                </button>
                
                <div className="text-center">
                  <h4 className="text-2xl font-bold text-text-main dark:text-white mb-1">
                    {allDates[currentDateIndex].dayOfWeek}
                  </h4>
                  <p className="text-lg font-semibold text-primary">
                    {allDates[currentDateIndex].formatted}
                  </p>
                </div>

                <button
                  onClick={nextDay}
                  disabled={currentDateIndex === allDates.length - 1}
                  className="p-3 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-primary text-2xl">chevron_right</span>
                </button>
              </div>

              {(() => {
                const availableHours = getAvailableHoursByDay()
                
                if (availableHours.length === 0) {
                  return (
                    <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                      <span className="material-symbols-outlined text-gray-300 dark:text-gray-600 text-5xl mb-4 block">event_busy</span>
                      <p className="text-text-muted dark:text-gray-400">
                        Nenhum horário disponível neste dia
                      </p>
                    </div>
                  )
                }

                return (
                  <div className="bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20 rounded-2xl p-6 border border-primary/20">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="material-symbols-outlined text-primary">schedule</span>
                      <span className="text-sm text-text-muted dark:text-gray-400">
                        {availableHours.length} {availableHours.length === 1 ? 'horário disponível' : 'horários disponíveis'}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {availableHours.map((hour, hourIdx) => (
                        <button
                          key={hourIdx}
                          onClick={() => handleSelectTime(hour)}
                          className="w-full bg-white dark:bg-gray-800 hover:bg-primary hover:text-white dark:hover:bg-primary border border-gray-200 dark:border-gray-700 hover:border-primary rounded-xl px-4 py-3 text-sm font-medium text-text-main dark:text-white transition-all shadow-sm hover:shadow-md group"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-sm group-hover:text-white">schedule</span>
                              <span>{hour}</span>
                            </div>
                            <span className="material-symbols-outlined text-sm opacity-0 group-hover:opacity-100 transition-opacity">arrow_forward</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })()}
            </div>

            <div className="mt-6">
              <button
                onClick={() => setShowAvailabilityModal(false)}
                className="w-full px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-text-main dark:text-white rounded-xl font-medium transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Seleção de Serviço */}
      {showServiceModal && selectedTime && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-surface-dark rounded-2xl max-w-2xl w-full p-8 border border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-text-main dark:text-white mb-2">
                  Escolha o Serviço
                </h2>
                <p className="text-text-muted dark:text-gray-400">
                  Horário: {selectedTime} - {allDates[currentDateIndex].formatted}
                </p>
              </div>
              <button
                onClick={() => setShowServiceModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <span className="material-symbols-outlined text-gray-400">close</span>
              </button>
            </div>

            <div className="space-y-3">
              {services && services.length > 0 ? (
                services.map((service) => (
                  <button
                    key={service._id}
                    onClick={() => handleSelectService(service)}
                    className="w-full bg-gray-50 dark:bg-gray-800/50 hover:bg-primary/10 dark:hover:bg-primary/20 border border-gray-200 dark:border-gray-700 hover:border-primary rounded-xl p-4 transition-all text-left group"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold text-text-main dark:text-white group-hover:text-primary">
                          {service.name}
                        </h3>
                        {service.description && (
                          <p className="text-sm text-text-muted dark:text-gray-400 mt-1">
                            {service.description}
                          </p>
                        )}
                        <p className="text-xs text-text-muted dark:text-gray-400 mt-1">
                          Duração: {service.durationMinutes} minutos
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">
                          R$ {service.price.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-text-muted dark:text-gray-400">
                    Nenhum serviço disponível
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação */}
      {showConfirmModal && selectedService && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-surface-dark rounded-2xl max-w-md w-full p-8 border border-gray-200 dark:border-gray-700">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-primary text-4xl">event_available</span>
              </div>
              <h2 className="text-2xl font-bold text-text-main dark:text-white mb-2">
                Confirmar Agendamento?
              </h2>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-text-muted dark:text-gray-400">Estabelecimento:</span>
                <span className="font-semibold text-text-main dark:text-white">
                  {selectedBarbearia.businessName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted dark:text-gray-400">Profissional:</span>
                <span className="font-semibold text-text-main dark:text-white">
                  {selectedProfessional.userName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted dark:text-gray-400">Serviço:</span>
                <span className="font-semibold text-text-main dark:text-white">
                  {selectedService.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted dark:text-gray-400">Data:</span>
                <span className="font-semibold text-text-main dark:text-white">
                  {allDates[currentDateIndex].formatted}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted dark:text-gray-400">Horário:</span>
                <span className="font-semibold text-text-main dark:text-white">
                  {selectedTime}
                </span>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-3 flex justify-between">
                <span className="text-text-muted dark:text-gray-400">Valor:</span>
                <span className="text-2xl font-bold text-primary">
                  R$ {selectedService.price.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-text-main dark:text-white rounded-xl font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmAppointment}
                className="flex-1 px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold shadow-lg shadow-primary/25 transition-all"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Agendar
