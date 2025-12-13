import { useState } from 'react'
import { useUser } from '@clerk/clerk-react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'

function Agenda() {
  const { user } = useUser()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [showHoursModal, setShowHoursModal] = useState(false)
  const [selectedDay, setSelectedDay] = useState(null)
  const [availability, setAvailability] = useState({})
  const [customHours, setCustomHours] = useState({}) // Horários customizados por dia
  const [newHour, setNewHour] = useState('')

  // Queries
  const userProfile = useQuery(api.users.getUserProfile, user ? { clerkId: user.id } : "skip")
  const ownerId = userProfile?.linkedToOwnerId || user?.id

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

  const toggleHour = (hour) => {
    const key = `${selectedDay.name}-${hour}`
    setAvailability(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const addCustomHour = () => {
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
    <div className="min-h-screen bg-green-950">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Agenda Semanal
            </h1>
            <p className="text-gray-300">
              Gerencie sua disponibilidade e horários de atendimento
            </p>
          </div>

          {/* Controles da Semana */}
          <div className="bg-surface-dark p-6 rounded-2xl shadow-xl border border-gray-700 mb-6">
            <div className="flex items-center justify-between">
              <button
                onClick={() => {
                  const newDate = new Date(selectedDate)
                  newDate.setDate(newDate.getDate() - 7)
                  setSelectedDate(newDate)
                }}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <span className="material-symbols-outlined text-white">chevron_left</span>
              </button>
              
              <div className="text-center">
                <h2 className="text-xl font-bold text-white">
                  {currentWeek[0]?.fullDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                </h2>
                <p className="text-gray-400 text-sm">
                  {currentWeek[0]?.fullDate.toLocaleDateString('pt-BR')} - {currentWeek[6]?.fullDate.toLocaleDateString('pt-BR')}
                </p>
              </div>

              <button
                onClick={() => {
                  const newDate = new Date(selectedDate)
                  newDate.setDate(newDate.getDate() + 7)
                  setSelectedDate(newDate)
                }}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <span className="material-symbols-outlined text-white">chevron_right</span>
              </button>
            </div>
          </div>

          {/* Grid da Agenda */}
          <div className="bg-surface-dark rounded-2xl shadow-xl border border-gray-700 overflow-hidden">
            {/* Cabeçalho dos dias */}
            <div className="grid grid-cols-8 border-b border-gray-700">
              <div className="p-4 bg-gray-800/50 sticky left-0">
                <span className="text-gray-400 text-sm font-medium">Horário</span>
              </div>
              {currentWeek.map((day, idx) => (
                <div key={idx} className="p-4 text-center border-l border-gray-700">
                  <div className="font-bold text-white">{day.name}</div>
                  <div className={`text-sm ${day.isToday ? 'text-primary font-bold' : 'text-gray-400'}`}>
                    {day.date}
                  </div>
                  <button
                    onClick={() => handleEditHours(day)}
                    className="mt-2 text-xs text-primary hover:text-primary-dark transition-colors"
                  >
                    Editar horários
                  </button>
                </div>
              ))}
            </div>

            {/* Grid de horários */}
            <div className="overflow-y-auto max-h-[600px]">
              {defaultHours.map((hour, hourIdx) => (
                <div key={hourIdx} className="grid grid-cols-8 border-b border-gray-700 hover:bg-gray-800/30 transition-colors">
                  <div className="p-3 bg-gray-800/50 sticky left-0 flex items-center">
                    <span className="text-gray-300 font-medium">{hour}</span>
                  </div>
                  {currentWeek.map((day, dayIdx) => (
                    <div
                      key={dayIdx}
                      className={`p-3 border-l border-gray-700 cursor-pointer transition-colors ${
                        isAvailable(day.name, hour)
                          ? 'bg-green-900/20 hover:bg-green-900/40'
                          : 'bg-red-900/20 hover:bg-red-900/40'
                      }`}
                      onClick={() => {
                        const key = `${day.name}-${hour}`
                        setAvailability(prev => ({ ...prev, [key]: !prev[key] }))
                      }}
                    >
                      <div className="text-center">
                        {isAvailable(day.name, hour) ? (
                          <span className="material-symbols-outlined text-green-400 text-sm">check_circle</span>
                        ) : (
                          <span className="material-symbols-outlined text-red-400 text-sm">cancel</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Legenda */}
          <div className="mt-6 flex gap-6 justify-center">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-900/40 rounded"></div>
              <span className="text-gray-300 text-sm">Disponível</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-900/40 rounded"></div>
              <span className="text-gray-300 text-sm">Indisponível</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Editar Horários */}
      {showHoursModal && selectedDay && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-surface-dark rounded-2xl max-w-md w-full p-8 border border-gray-700 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-white mb-4">
              Editar Horários - {selectedDay.name}
            </h2>
            <p className="text-gray-300 mb-6">
              Selecione os horários disponíveis para atendimento
            </p>

            {/* Adicionar horário customizado */}
            <div className="mb-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
              <label className="block text-gray-300 mb-2 font-medium">Adicionar horário personalizado</label>
              <div className="flex gap-2">
                <input
                  type="time"
                  value={newHour}
                  onChange={(e) => setNewHour(e.target.value)}
                  className="flex-1 p-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
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
                        ? 'border-green-500 bg-green-900/20'
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
                          onClick={() => toggleHour(hour)}
                          className="p-1"
                        >
                          {available ? (
                            <span className="material-symbols-outlined text-green-400">check_circle</span>
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
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
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

