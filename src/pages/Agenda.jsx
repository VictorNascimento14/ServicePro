import { useState, useEffect } from 'react'
import { useUser } from '@clerk/clerk-react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'

function Agenda() {
  const { user } = useUser()
  const [viewMode, setViewMode] = useState('appointments') // 'availability' ou 'appointments'
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [showHoursModal, setShowHoursModal] = useState(false)
  const [selectedDay, setSelectedDay] = useState(null)
  const [availability, setAvailability] = useState({})
  const [customHours, setCustomHours] = useState({}) // Horários customizados por dia
  const [newHour, setNewHour] = useState('')

  // Queries
  const userProfile = useQuery(api.users.getUserProfile, user ? { clerkId: user.id } : "skip")
  const ownerId = userProfile?.linkedToOwnerId || user?.id
  
  // Buscar disponibilidade do Convex
  const savedAvailability = useQuery(
    api.availability.getAvailability,
    ownerId ? { ownerId } : "skip"
  )

  // Buscar agendamentos do profissional
  const myAppointments = useQuery(
    api.appointments.getByProfessionalClerkId,
    user ? { professionalClerkId: user.id } : "skip"
  )

  // Mutation para salvar disponibilidade
  const saveAvailability = useMutation(api.availability.saveAvailability)

  // Carregar disponibilidade salva
  useEffect(() => {
    if (savedAvailability && savedAvailability.length > 0) {
      const availMap = {}
      savedAvailability.forEach(item => {
        const key = `${item.dayOfWeek}-${item.hour}`
        availMap[key] = item.isAvailable
      })
      setAvailability(availMap)
    }
  }, [savedAvailability])

  // Dias da semana
  const weekDays = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
  
  // Horários padrão (08:00 - 20:00)
  const defaultHours = Array.from({ length: 13 }, (_, i) => {
    const hour = 8 + i
    return `${hour.toString().padStart(2, '0')}:00`
  })

  // Obter os 7 dias da semana atual
  const getWeekDays = () => {
    const week = []
    const today = new Date(selectedDate)
    const day = today.getDay()
    const diff = today.getDate() - day // Ajustar para domingo
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today.setDate(diff + i))
      week.push({
        name: weekDays[i],
        date: date.getDate(),
        fullDate: new Date(date),
        isToday: new Date().toDateString() === date.toDateString()
      })
    }
    return week
  }

  const currentWeek = getWeekDays()

  const handleEditHours = (day) => {
    setSelectedDay(day)
    setShowHoursModal(true)
  }

  const toggleHour = async (dayName, hour) => {
    const key = `${dayName}-${hour}`
    const newValue = !availability[key]
    
    // Atualizar estado local
    setAvailability(prev => ({
      ...prev,
      [key]: newValue
    }))

    // Salvar no Convex
    if (ownerId) {
      try {
        await saveAvailability({
          ownerId,
          dayOfWeek: dayName,
          hour,
          isAvailable: newValue
        })
      } catch (error) {
        console.error('Erro ao salvar disponibilidade:', error)
      }
    }
  }

  const addCustomHour = async () => {
    if (!newHour || !selectedDay) return
    
    const dayKey = selectedDay.name
    const currentDayHours = customHours[dayKey] || []
    
    if (!currentDayHours.includes(newHour)) {
      setCustomHours(prev => ({
        ...prev,
        [dayKey]: [...currentDayHours, newHour].sort()
      }))
      // Marcar como disponível por padrão
      setAvailability(prev => ({
        ...prev,
        [`${dayKey}-${newHour}`]: true
      }))

      // Salvar no Convex
      if (ownerId) {
        try {
          await saveAvailability({
            ownerId,
            dayOfWeek: dayKey,
            hour: newHour,
            isAvailable: true
          })
        } catch (error) {
          console.error('Erro ao salvar horário customizado:', error)
        }
      }
    }
    setNewHour('')
  }

  const removeCustomHour = (hour) => {
    const dayKey = selectedDay.name
    const currentDayHours = customHours[dayKey] || []
    
    setCustomHours(prev => ({
      ...prev,
      [dayKey]: currentDayHours.filter(h => h !== hour)
    }))
    
    // Remover da disponibilidade também
    const key = `${dayKey}-${hour}`
    setAvailability(prev => {
      const newAvail = { ...prev }
      delete newAvail[key]
      return newAvail
    })
  }

  const getAllHoursForDay = (dayName) => {
    const customDayHours = customHours[dayName] || []
    return [...defaultHours, ...customDayHours].sort()
  }

  const isAvailable = (day, hour) => {
    const key = `${day}-${hour}`
    return availability[key] !== false // Por padrão está disponível
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background-dark">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-text-main dark:text-white mb-2">
              Agenda Semanal
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Gerencie sua disponibilidade e horários de atendimento
            </p>
          </div>

          {/* Toggle entre modos */}
          <div className="bg-white dark:bg-surface-dark p-2 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6 inline-flex">
            <button
              onClick={() => setViewMode('appointments')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                viewMode === 'appointments'
                  ? 'bg-primary text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-xl">event</span>
                <span>Meus Agendamentos</span>
                {myAppointments && myAppointments.length > 0 && (
                  <span className="ml-1 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                    {myAppointments.length}
                  </span>
                )}
              </div>
            </button>
            <button
              onClick={() => setViewMode('availability')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                viewMode === 'availability'
                  ? 'bg-primary text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-xl">edit_calendar</span>
                <span>Editar Disponibilidade</span>
              </div>
            </button>
          </div>

          {viewMode === 'availability' ? (
            // VIEW DE DISPONIBILIDADE (código existente)
            <>

          {/* Controles da Semana */}
          <div className="bg-white dark:bg-surface-dark p-6 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 mb-6">
            <div className="flex items-center justify-between">
              <button
                onClick={() => {
                  const newDate = new Date(selectedDate)
                  newDate.setDate(newDate.getDate() - 7)
                  setSelectedDate(newDate)
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <span className="material-symbols-outlined text-text-main dark:text-white">chevron_left</span>
              </button>
              
              <div className="text-center">
                <h2 className="text-xl font-bold text-text-main dark:text-white">
                  {currentWeek[0]?.fullDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  {currentWeek[0]?.fullDate.toLocaleDateString('pt-BR')} - {currentWeek[6]?.fullDate.toLocaleDateString('pt-BR')}
                </p>
              </div>

              <button
                onClick={() => {
                  const newDate = new Date(selectedDate)
                  newDate.setDate(newDate.getDate() + 7)
                  setSelectedDate(newDate)
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <span className="material-symbols-outlined text-text-main dark:text-white">chevron_right</span>
              </button>
            </div>
          </div>

          {/* Grid da Agenda */}
          <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-x-auto">
            {/* Cabeçalho dos dias */}
            <div className="grid grid-cols-8 border-b border-gray-200 dark:border-gray-700 min-w-[800px]">
              <div className="p-2 md:p-4 bg-gray-100 dark:bg-gray-800/50 sticky left-0">
                <span className="text-gray-600 dark:text-gray-400 text-xs md:text-sm font-medium">Horário</span>
              </div>
              {currentWeek.map((day, idx) => (
                <div key={idx} className="p-2 md:p-4 text-center border-l border-gray-200 dark:border-gray-700 min-w-[90px]">
                  <div className="font-bold text-text-main dark:text-white text-xs md:text-base truncate">{day.name}</div>
                  <div className={`text-xs md:text-sm ${day.isToday ? 'text-primary font-bold' : 'text-gray-500 dark:text-gray-400'}`}>
                    {day.date}
                  </div>
                  <button
                    onClick={() => handleEditHours(day)}
                    className="mt-2 px-1.5 md:px-2 py-1 text-[10px] md:text-xs bg-primary/20 hover:bg-primary/30 text-primary rounded transition-colors flex items-center gap-0.5 md:gap-1 mx-auto whitespace-nowrap"
                  >
                    <span className="material-symbols-outlined text-xs">add_circle</span>
                    <span className="hidden sm:inline">Personalizar</span>
                    <span className="sm:hidden">+</span>
                  </button>
                </div>
              ))}
            </div>

            {/* Grid de horários */}
            <div className="overflow-y-auto max-h-[600px] min-w-[800px]">
              {defaultHours.map((hour, hourIdx) => (
                <div key={hourIdx} className="grid grid-cols-8 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                  <div className="p-2 md:p-3 bg-gray-100 dark:bg-gray-800/50 sticky left-0 flex items-center">
                    <span className="text-text-main dark:text-gray-300 font-medium text-xs md:text-base">{hour}</span>
                  </div>
                  {currentWeek.map((day, dayIdx) => {
                    const available = isAvailable(day.name, hour)
                    return (
                      <div
                        key={dayIdx}
                        className={`p-2 md:p-3 border-l border-gray-200 dark:border-gray-700 cursor-pointer transition-all select-none min-w-[90px] ${
                          available
                            ? 'bg-emerald-100 dark:bg-primary/30 hover:bg-emerald-200 dark:hover:bg-primary/40 active:bg-emerald-300 dark:active:bg-primary/50 border-emerald-200 dark:border-primary/20'
                            : 'bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 active:bg-red-200 dark:active:bg-red-900/60'
                        }`}
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          toggleHour(day.name, hour)
                        }}
                      >
                        <div className="text-center">
                          {available ? (
                            <span className="material-symbols-outlined text-emerald-600 dark:text-primary text-sm">check_circle</span>
                          ) : (
                            <span className="material-symbols-outlined text-red-500 dark:text-red-400 text-sm">cancel</span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Legenda */}
          <div className="mt-6 flex gap-6 justify-center">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-emerald-200 dark:bg-primary/30 rounded border border-emerald-300 dark:border-primary/40"></div>
              <span className="text-gray-600 dark:text-gray-300 text-sm">Disponível</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-100 dark:bg-red-900/40 rounded border border-red-200 dark:border-red-900/60"></div>
              <span className="text-gray-600 dark:text-gray-300 text-sm">Indisponível</span>
            </div>
          </div>
          </>
          ) : (
            // VIEW DE AGENDAMENTOS
            <div className="space-y-6">
              {!myAppointments ? (
                <div className="bg-white dark:bg-surface-dark rounded-2xl p-8 text-center border border-gray-200 dark:border-gray-700">
                  <span className="material-symbols-outlined text-gray-300 dark:text-gray-600 text-5xl mb-4 block animate-spin">sync</span>
                  <p className="text-gray-600 dark:text-gray-300">Carregando agendamentos...</p>
                </div>
              ) : myAppointments.length === 0 ? (
                <div className="bg-white dark:bg-surface-dark rounded-2xl p-12 text-center border border-gray-200 dark:border-gray-700">
                  <span className="material-symbols-outlined text-gray-300 dark:text-gray-600 text-6xl mb-4 block">event_busy</span>
                  <h3 className="text-xl font-semibold text-text-main dark:text-white mb-2">
                    Nenhum agendamento
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Você ainda não tem agendamentos marcados
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {myAppointments.map((appointment) => (
                    <div
                      key={appointment._id}
                      className="bg-white dark:bg-surface-dark rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex gap-4 flex-1">
                          <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <span className="material-symbols-outlined text-primary text-3xl">event</span>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-text-main dark:text-white mb-3">
                              {appointment.service?.name || 'Serviço'}
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-base">
                              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                <span className="material-symbols-outlined text-lg">person</span>
                                <span>{appointment.clientName}</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                <span className="material-symbols-outlined text-lg">calendar_today</span>
                                <span>{appointment.date}</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                <span className="material-symbols-outlined text-lg">schedule</span>
                                <span>{appointment.time}</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                <span className="material-symbols-outlined text-lg">calendar_view_week</span>
                                <span>{appointment.dayOfWeek}</span>
                              </div>
                            </div>
                            {appointment.clientPhone && (
                              <div className="flex items-center gap-2 text-base text-gray-600 dark:text-gray-400 mt-3">
                                <span className="material-symbols-outlined text-lg">phone</span>
                                <span>{appointment.clientPhone}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <div className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium mb-2 ${
                            appointment.status === 'confirmed' 
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                              : appointment.status === 'cancelled'
                              ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                              : appointment.status === 'completed'
                              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-400'
                          }`}>
                            {appointment.status === 'confirmed' ? 'Confirmado' : 
                             appointment.status === 'cancelled' ? 'Cancelado' : 
                             appointment.status === 'completed' ? 'Concluído' :
                             appointment.status === 'pending' ? 'Pendente' : appointment.status}
                          </div>
                          <div className="text-2xl font-bold text-primary">
                            R$ {(appointment.totalValue || 0).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal Editar Horários */}
      {showHoursModal && selectedDay && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-surface-dark rounded-2xl max-w-md w-full p-8 border border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-text-main dark:text-white mb-4">
              Editar Horários - {selectedDay.name}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Selecione os horários disponíveis para atendimento
            </p>

            {/* Adicionar horário customizado */}
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
              <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">Adicionar horário personalizado</label>
              <div className="flex gap-2">
                <input
                  type="time"
                  value={newHour}
                  onChange={(e) => setNewHour(e.target.value)}
                  className="flex-1 p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-text-main dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                />
                <button
                  onClick={addCustomHour}
                  className="px-4 py-2 bg-primary hover:bg-primary-dark text-primary-content rounded-lg font-medium transition-colors"
                >
                  Adicionar
                </button>
              </div>
            </div>

            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {getAllHoursForDay(selectedDay.name).map((hour) => {
                const available = isAvailable(selectedDay.name, hour)
                const isCustom = (customHours[selectedDay.name] || []).includes(hour)
                
                return (
                  <div
                    key={hour}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      available
                        ? 'border-primary bg-primary/20'
                        : 'border-red-500 bg-red-900/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">{hour}</span>
                        {isCustom && (
                          <span className="text-xs text-primary bg-primary/20 px-2 py-1 rounded">
                            Personalizado
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleHour(selectedDay.name, hour)}
                          className="p-1 hover:bg-gray-700/50 rounded transition-colors"
                        >
                          {available ? (
                            <span className="material-symbols-outlined text-primary">check_circle</span>
                          ) : (
                            <span className="material-symbols-outlined text-red-400">cancel</span>
                          )}
                        </button>
                        {isCustom && (
                          <button
                            onClick={() => removeCustomHour(hour)}
                            className="p-1 hover:bg-red-900/30 rounded transition-colors"
                            title="Remover horário"
                          >
                            <span className="material-symbols-outlined text-red-400 text-sm">delete</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  // Marcar todos como disponíveis
                  const newAvailability = {}
                  getAllHoursForDay(selectedDay.name).forEach(hour => {
                    newAvailability[`${selectedDay.name}-${hour}`] = true
                  })
                  setAvailability(prev => ({ ...prev, ...newAvailability }))
                }}
                className="flex-1 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium transition-colors"
              >
                Marcar Todos
              </button>
              <button
                onClick={() => setShowHoursModal(false)}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
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

export default Agenda


