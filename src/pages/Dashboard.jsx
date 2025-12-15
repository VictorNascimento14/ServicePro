import PageHeader from '../components/PageHeader'
import { useUser, useClerk } from '@clerk/clerk-react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useState } from 'react'

function Dashboard() {
  const { user } = useUser()
  const { signOut } = useClerk()
  const resetProfile = useMutation(api.users.resetUserProfile)
  const [showNotifications, setShowNotifications] = useState(false)
  const markAsRead = useMutation(api.notifications.markAsRead)
  const markAllAsRead = useMutation(api.notifications.markAllAsRead)
  
  // Buscar perfil do usuário e configurações
  const userProfile = useQuery(api.users.getUserProfile, user ? { clerkId: user.id } : "skip")
  const businessSettings = useQuery(api.services.getBusinessSettings, user ? { ownerId: user.id } : "skip")
  const todayDate = new Date().toISOString().split('T')[0]
  console.log('🗓️ Buscando agendamentos para a data:', todayDate)
  const appointments = useQuery(api.appointments.getByDateForUser, user ? { clerkId: user.id, date: todayDate } : "skip")
  
  // Buscar TODOS os agendamentos futuros para encontrar o próximo
  const allAppointments = useQuery(
    api.appointments.getByProfessionalClerkId,
    user && userProfile?.userType !== 'client' ? { professionalClerkId: user.id } : "skip"
  )
  
  // Buscar solicitações de vínculo pendentes
  const pendingRequests = useQuery(
    api.linkRequests.getPendingRequests,
    user && userProfile?.userType === 'owner' ? { ownerId: user.id } : "skip"
  )
  
  // Buscar notificações
  const notifications = useQuery(
    api.notifications.getByRecipient,
    user ? { recipientClerkId: user.id } : "skip"
  )
  const unreadCount = useQuery(
    api.notifications.countUnread,
    user ? { recipientClerkId: user.id } : "skip"
  )
  
  // Buscar agendamentos do cliente (se for cliente)
  const clientAppointments = useQuery(
    api.appointments.getByClientClerkId,
    user && userProfile?.userType === 'client' ? { clientClerkId: user.id } : "skip"
  )

  // Debug: ver o que está sendo retornado
  console.log('User Profile:', userProfile)
  console.log('Appointments (hoje):', appointments)
  console.log('All Appointments:', allAppointments)
  console.log('Data de hoje:', new Date().toISOString().split('T')[0])
  console.log('Client Appointments:', clientAppointments)
  console.log('User Type:', userProfile?.userType)
  
  // Nome do usuário e negócio
  const userName = userProfile?.userName || user?.firstName || user?.fullName?.split(' ')[0] || 'Usuário'
  const businessName = userProfile?.userType === 'client' 
    ? 'Cliente' 
    : (userProfile?.businessName || businessSettings?.businessName || 'Sua Barbearia')
  
  // Estatísticas baseadas em dados reais
  const todayAppointments = appointments?.length || 0
  // Só mostrar solicitações pendentes se aprovação automática NÃO estiver ativada
  const pendingRequestsCount = userProfile?.autoApproveClients ? 0 : (pendingRequests?.length || 0)
  
  // Calcular faturamento previsto (agendamentos de hoje que não estão cancelados)
  const expectedRevenue = appointments?.reduce((total, appointment) => {
    if (appointment.status !== 'cancelled' && appointment.status !== 'completed') {
      return total + (appointment.totalValue || 0)
    }
    return total
  }, 0) || 0
  
  // Encontrar o próximo agendamento (mais próximo no futuro)
  const nextAppointment = allAppointments?.filter(apt => {
    if (apt.status === 'cancelled') return false
    
    const now = new Date()
    // Converter data brasileira DD/MM/YYYY para formato ISO
    const [day, month, year] = apt.date.split('/')
    const [hours, minutes] = apt.time.split(':')
    const aptDateTime = new Date(year, month - 1, day, hours, minutes)
    
    return aptDateTime > now
  }).sort((a, b) => {
    const [dayA, monthA, yearA] = a.date.split('/')
    const [hoursA, minutesA] = a.time.split(':')
    const dateA = new Date(yearA, monthA - 1, dayA, hoursA, minutesA)
    
    const [dayB, monthB, yearB] = b.date.split('/')
    const [hoursB, minutesB] = b.time.split(':')
    const dateB = new Date(yearB, monthB - 1, dayB, hoursB, minutesB)
    
    return dateA - dateB
  })[0]
  const searchBar = (
    <div className="relative group">
      <div className="flex items-center bg-white dark:bg-surface-dark rounded-full px-4 py-2.5 shadow-sm border border-transparent focus-within:border-primary transition-all w-80">
        <span className="material-symbols-outlined text-text-muted dark:text-gray-500">search</span>
        <input
          className="bg-transparent border-none outline-none focus:ring-0 text-sm ml-2 w-full text-text-main dark:text-gray-200 placeholder-gray-400"
          placeholder="Buscar clientes ou agendamentos..."
          type="text"
        />
      </div>
    </div>
  )

  const notificationButton = (
    <button 
      onClick={() => setShowNotifications(!showNotifications)}
      className="relative p-2.5 rounded-full bg-white dark:bg-surface-dark shadow-sm text-text-muted hover:text-primary transition-colors"
    >
      <span className="material-symbols-outlined">notifications</span>
      {unreadCount > 0 && (
        <span className="absolute top-2 right-2.5 w-5 h-5 bg-red-500 rounded-full border-2 border-white dark:border-surface-dark flex items-center justify-center text-white text-[10px] font-bold">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>
  )

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
    <>
      <PageHeader
        title="Visão Geral"
        subtitle={`Bem-vindo, ${userName}! ${businessName}`}
        actions={
          <>
            {searchBar}
            {notificationButton}
            {resetButton}
            {signOutButton}
          </>
        }
      />

      {/* Painel de Notificações */}
      {showNotifications && (
        <div className="fixed top-20 right-4 w-96 bg-white dark:bg-surface-dark rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 max-h-[600px] overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
            <h3 className="font-bold text-text-main dark:text-white">Notificações</h3>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={async () => await markAllAsRead({ recipientClerkId: user.id })}
                  className="text-xs text-primary hover:underline"
                >
                  Marcar todas como lidas
                </button>
              )}
              <button
                onClick={() => setShowNotifications(false)}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
              >
                <span className="material-symbols-outlined text-sm text-gray-500">close</span>
              </button>
            </div>
          </div>

          <div className="overflow-y-auto flex-1">
            {!notifications || notifications.length === 0 ? (
              <div className="p-8 text-center">
                <span className="material-symbols-outlined text-gray-300 dark:text-gray-600 text-5xl mb-4 block">notifications_off</span>
                <p className="text-gray-500 dark:text-gray-400">Nenhuma notificação</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    onClick={async () => {
                      if (!notification.isRead) {
                        await markAsRead({ id: notification._id })
                      }
                    }}
                    className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer ${
                      !notification.isRead ? 'bg-primary/5 dark:bg-primary/10' : ''
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        notification.type === 'new_appointment' ? 'bg-green-100 dark:bg-green-900/30' :
                        notification.type === 'cancelled_appointment' ? 'bg-red-100 dark:bg-red-900/30' :
                        'bg-blue-100 dark:bg-blue-900/30'
                      }`}>
                        <span className={`material-symbols-outlined text-sm ${
                          notification.type === 'new_appointment' ? 'text-green-600 dark:text-green-400' :
                          notification.type === 'cancelled_appointment' ? 'text-red-600 dark:text-red-400' :
                          'text-blue-600 dark:text-blue-400'
                        }`}>
                          {notification.type === 'new_appointment' ? 'event_available' :
                           notification.type === 'cancelled_appointment' ? 'event_busy' :
                           'notifications'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-semibold text-sm text-text-main dark:text-white truncate">
                            {notification.title}
                          </h4>
                          {!notification.isRead && (
                            <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1"></span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(notification.createdAt).toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 scroll-smooth">
        {/* Quick Stats */}
        <section className={`grid grid-cols-1 gap-4 md:gap-6 ${userProfile?.autoApproveClients ? 'md:grid-cols-2' : 'md:grid-cols-3'}`}>
          <div className="bg-white dark:bg-surface-dark p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col justify-between h-32 relative overflow-hidden group">
            <div className="absolute right-[-10px] top-[-10px] opacity-5 dark:opacity-10 group-hover:scale-110 transition-transform duration-500">
              <span className="material-symbols-outlined text-[100px] text-primary">calendar_clock</span>
            </div>
            <div>
              <p className="text-sm font-medium text-text-muted dark:text-gray-400">Agendamentos Hoje</p>
              <h3 className="text-3xl font-bold mt-1 text-text-main dark:text-white">{todayAppointments}</h3>
            </div>
            <div className="flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-gray-400">
              <span className="material-symbols-outlined text-[16px]">calendar_today</span>
              <span>Hoje</span>
            </div>
          </div>

          <div className="bg-white dark:bg-surface-dark p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col justify-between h-32 relative overflow-hidden group">
            <div className="absolute right-[-10px] top-[-10px] opacity-5 dark:opacity-10 group-hover:scale-110 transition-transform duration-500">
              <span className="material-symbols-outlined text-[100px] text-primary">payments</span>
            </div>
            <div>
              <p className="text-sm font-medium text-text-muted dark:text-gray-400">Faturamento Previsto</p>
              <h3 className="text-3xl font-bold mt-1 text-text-main dark:text-white">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(expectedRevenue)}
              </h3>
            </div>
            <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 mt-2">
              <div className="bg-primary h-1.5 rounded-full transition-all duration-500" style={{ width: expectedRevenue > 0 ? '65%' : '0%' }}></div>
            </div>
          </div>

          {/* Card de Solicitações Pendentes - só aparece se aprovação automática NÃO estiver ativada */}
          {!userProfile?.autoApproveClients && (
            <div className="bg-white dark:bg-surface-dark p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col justify-between h-32 relative overflow-hidden group">
              <div className="absolute right-[-10px] top-[-10px] opacity-5 dark:opacity-10 group-hover:scale-110 transition-transform duration-500">
                <span className="material-symbols-outlined text-[100px] text-orange-400">notifications_active</span>
              </div>
              <div>
                <p className="text-sm font-medium text-text-muted dark:text-gray-400">Solicitações Pendentes</p>
                <h3 className="text-3xl font-bold mt-1 text-text-main dark:text-white">{pendingRequestsCount}</h3>
              </div>
              <p className="text-xs text-text-muted dark:text-gray-500 mt-1">
                {pendingRequestsCount > 0 ? 'Requer sua atenção' : 'Nenhuma pendente'}
              </p>
            </div>
          )}
        </section>

        {/* Mensagem quando não há dados */}
        {todayAppointments === 0 && userProfile?.userType !== 'client' && (
          <div className="bg-white dark:bg-surface-dark rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 text-center">
            <div className="flex flex-col items-center gap-4">
              <span className="material-symbols-outlined text-[80px] text-gray-300 dark:text-gray-600">event_available</span>
              <div>
                <h3 className="text-lg font-bold text-text-main dark:text-white mb-2">Nenhum agendamento hoje</h3>
                <p className="text-sm text-text-muted dark:text-gray-400">
                  Comece criando seus clientes, serviços e profissionais nas páginas do menu lateral.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Seção para Cliente */}
        {userProfile?.userType === 'client' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-text-main dark:text-white flex items-center gap-2">
                <span className="w-2 h-6 bg-primary rounded-full"></span>
                Próximo Agendamento
              </h3>
            </div>

            {clientAppointments && clientAppointments.length > 0 ? (
              clientAppointments.map((appointment) => (
                  <div key={appointment._id} className="bg-white dark:bg-surface-dark rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 mb-4">
                    <div className="flex flex-col gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold uppercase tracking-wider text-primary">
                            {appointment.date} - {appointment.time}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            appointment.status === 'confirmed' ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' :
                            appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400' :
                            'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400'
                          }`}>
                            {appointment.status === 'confirmed' ? 'Confirmado' :
                             appointment.status === 'pending' ? 'Pendente' :
                             appointment.status === 'completed' ? 'Concluído' : 'Cancelado'}
                          </span>
                        </div>
                        <h2 className="text-xl font-bold text-text-main dark:text-white leading-tight">
                          {appointment.owner?.businessName || 'Barbearia'}
                        </h2>
                        <p className="text-base text-text-muted dark:text-gray-400 mt-1">
                          Profissional: {appointment.professional?.userName || 'N/A'}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-gray-100 dark:bg-gray-700 text-xs font-medium text-text-main dark:text-gray-200">
                          <span className="material-symbols-outlined text-[14px]">cut</span>
                          {appointment.service?.name || 'Serviço'}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-primary/10 text-primary text-xs font-bold">
                          <span className="material-symbols-outlined text-[14px]">payments</span>
                          R$ {appointment.totalValue.toFixed(2)}
                        </span>
                      </div>

                      {appointment.status === 'confirmed' && (
                        <div className="flex items-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                          <span className="text-xs text-text-muted dark:text-gray-400">
                            {appointment.owner?.location || appointment.owner?.address || 'Aguardando confirmação'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
            ) : (
              <div className="bg-white dark:bg-surface-dark rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 text-center">
                <span className="material-symbols-outlined text-gray-300 dark:text-gray-600 text-5xl mb-4 block">event_busy</span>
                <h3 className="text-lg font-semibold text-text-main dark:text-white mb-2">Nenhum agendamento próximo</h3>
                <p className="text-text-muted dark:text-gray-400">Agende seu próximo corte para garantir seu horário!</p>
                <p className="text-xs text-gray-500 mt-2">Debug: {clientAppointments === undefined ? 'Carregando...' : `${clientAppointments?.length || 0} agendamentos encontrados`}</p>
              </div>
            )}
          </div>
        )}

        {/* Main Grid Layout - só mostra para profissionais */}
        {todayAppointments > 0 && userProfile?.userType !== 'client' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Próximo Agendamento - Para Profissional */}
            {userProfile?.userType !== 'client' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-text-main dark:text-white flex items-center gap-2">
                    <span className="w-2 h-6 bg-primary rounded-full"></span>
                    Próximo Agendamento
                  </h3>
                </div>

                {nextAppointment ? (
                  <div className="bg-white dark:bg-surface-dark rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
                    <div className="flex flex-col gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold uppercase tracking-wider text-primary">
                            {nextAppointment.date} - {nextAppointment.time}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            nextAppointment.status === 'confirmed' ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' :
                            nextAppointment.status === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400' :
                            'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400'
                          }`}>
                            {nextAppointment.status === 'confirmed' ? 'Confirmado' :
                             nextAppointment.status === 'pending' ? 'Pendente' : 'Completado'}
                          </span>
                        </div>
                        <h2 className="text-xl font-bold text-text-main dark:text-white leading-tight">
                          {nextAppointment.client?.userName || 'Cliente'}
                        </h2>
                        <p className="text-base text-text-muted dark:text-gray-400 mt-1">
                          {nextAppointment.service?.name || 'Serviço'}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-primary/10 text-primary text-xs font-bold">
                          <span className="material-symbols-outlined text-[14px]">payments</span>
                          R$ {nextAppointment.totalValue?.toFixed(2) || '0.00'}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white dark:bg-surface-dark rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 text-center">
                    <span className="material-symbols-outlined text-gray-300 dark:text-gray-600 text-5xl mb-4 block">event_busy</span>
                    <h3 className="text-lg font-semibold text-text-main dark:text-white mb-2">Nenhum agendamento próximo</h3>
                    <p className="text-text-muted dark:text-gray-400">Aguardando próximo cliente</p>
                  </div>
                )}
              </div>
            )}

            {/* A Seguir - card com foto */}
            {userProfile?.userType !== 'client' && nextAppointment && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-text-main dark:text-white flex items-center gap-2">
                    <span className="w-2 h-6 bg-primary rounded-full"></span>
                    A Seguir
                  </h3>
                  <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
                    {nextAppointment.time}
                  </span>
                </div>

                <div className="bg-white dark:bg-surface-dark rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row gap-6 items-stretch">
                <div
                  className="w-full md:w-1/3 aspect-video md:aspect-auto rounded-xl bg-cover bg-center relative overflow-hidden"
                  style={{
                    backgroundImage:
                      'url("https://lh3.googleusercontent.com/aida-public/AB6AXuB-ykvKcY80AY36dOgA21yBrtLzv4CQVjVTb1psEKFxC5VEN32aP6Mqd7P0YXJ6FBVQy1J-W-X67TuWU5nbEH-L_encK3If_u85VZPYn6KymkV6TWN78jjIkLmSvocU20QXiX1Prh4V5NuRNqPSJ7DqnDSB3IvZYeV1SGr7YHezmhvqL85faxKPUn3qk7JozwKh2oU683DXp082AUc0OtV9Ht7vhxQY3gX2S65xzA-B2PxgEt9CtEPX2rWkFu031SYwJWFpvfvBqyM")',
                  }}
                >
                  <div className="absolute inset-0 bg-black/20"></div>
                </div>

                <div className="flex-1 flex flex-col justify-center gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-text-muted dark:text-gray-400">
                        {nextAppointment.time}
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold text-text-main dark:text-white leading-tight">
                      {nextAppointment.client?.userName || 'Cliente'}
                    </h2>
                    <p className="text-base text-text-muted dark:text-gray-400 mt-1">
                      {nextAppointment.service?.name || 'Serviço'}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-gray-100 dark:bg-gray-700 text-xs font-medium text-text-main dark:text-gray-200">
                      <span className="material-symbols-outlined text-[14px]">payments</span>
                      R$ {nextAppointment.totalValue?.toFixed(2) || '0.00'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mt-2">
                    <button className="flex-1 bg-primary hover:bg-green-400 text-primary-content font-bold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors">
                      <span className="material-symbols-outlined">check_circle</span>
                      Check-in
                    </button>
                    <button className="px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-text-main dark:text-white font-medium transition-colors">
                      <span className="material-symbols-outlined">more_horiz</span>
                    </button>
                  </div>
                </div>
              </div>
              </div>
            )}

            {/* Agenda do Dia */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-text-main dark:text-white">Agenda do Dia</h3>
                <a className="text-sm font-semibold text-primary hover:underline" href="#">
                  Ver tudo
                </a>
              </div>

              <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {appointments && appointments.length > 0 ? (
                    appointments.map((appointment, idx) => (
                      <div
                        key={appointment._id}
                        className={`p-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors ${
                          appointment.status === 'pending' ? 'opacity-75' : ''
                        }`}
                      >
                        <div className="flex flex-col items-center min-w-[60px]">
                          <span className="text-lg font-bold text-text-main dark:text-white">{appointment.time}</span>
                        </div>
                        <div className="w-1 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                        <div className="flex-1">
                          <h4 className="font-bold text-text-main dark:text-white">
                            {appointment.client?.userName || 'Cliente'}
                          </h4>
                          <p className="text-sm text-text-muted dark:text-gray-400">
                            {appointment.service?.name || 'Serviço'}
                          </p>
                        </div>
                        <div className="text-right hidden sm:block">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              appointment.status === 'confirmed'
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                : appointment.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                            }`}
                          >
                            {appointment.status === 'confirmed' ? 'Confirmado' :
                             appointment.status === 'pending' ? 'Aguardando' :
                             appointment.status === 'completed' ? 'Concluído' : 'Cancelado'}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center">
                      <span className="material-symbols-outlined text-gray-300 dark:text-gray-600 text-5xl mb-4 block">event_busy</span>
                      <p className="text-text-muted dark:text-gray-400">Nenhum agendamento hoje</p>
                    </div>
                  )}
                </div>
                {appointments && appointments.length > 0 && (
                  <div className="bg-gray-50 dark:bg-gray-800/50 p-3 text-center border-t border-gray-100 dark:border-gray-800">
                    <p className="text-xs text-text-muted font-medium">Fim dos agendamentos de hoje</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-8">
            {/* Pending Requests - só aparece se aprovação automática NÃO estiver ativada */}
            {!userProfile?.autoApproveClients && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-text-main dark:text-white">Solicitações</h3>
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-content text-xs font-bold">
                    3
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  {[
                    { time: 'Hoje, 18:00', name: 'Julia Lima', service: 'Corte Feminino', avatar: 'AB6AXuCF-lDnHi3vard-Z-y53yCjpPJInL3s12I4Z-cxtDlC3tYOIYNZQcjZw7fRhEA7dZYgxGFFJgHE-DkmhkFKanjFPqFQeiz1ZZ-QpFxCFcnG6SThUky3ywTlBLh-vDp0WRzjdta8KyMjb-zBx_BeLkRiOmLOH3Sy4HDyj6j2boGNjBDwic0r0LVIRUw2lwuqQH9O0Q_QrDmJjqlGAMRkMZZYUOCyyEDf08TvAwsZV3np3EHqTVI9iOqptkaQG72VnuHK_WgSRpFmplY' },
                    { time: 'Amanhã, 09:00', name: 'Ricardo Gomes', service: 'Barba', avatar: 'AB6AXuACE_zbe8JooUy0XjlE58coXLadSbf_I0OVMZcqV6Rhl3WgzgD9ZU7r7IL1W27CE9-rU98C6CL79F0atorRYzUslm3w-H1tix0anA6iEtluJRB-NWYBevxt776ppfj3kq0aWGETFi2OrIYTHutcGpEUUxB4_gxIQmIOLtIejhWb3PKIv-NHlxPy8YSd3JzvPvriVHn_WteP52zhmThVRPDeXeSLdZuomPr_eFXP70Ugi8qOMtZg8aXZx9gvmFRUY55ko5Y2_cEtM94' },
                  ].map((request, idx) => (
                    <div
                      key={idx}
                      className="bg-white dark:bg-surface-dark p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 relative"
                    >
                      <div className="absolute top-4 right-4 text-xs font-medium text-text-muted bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                        {request.time}
                      </div>
                      <div className="flex items-start gap-3 mb-3">
                        <div
                          className="w-10 h-10 rounded-full bg-cover bg-center"
                          style={{
                            backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/${request.avatar}")`,
                          }}
                        />
                        <div>
                          <p className="font-bold text-text-main dark:text-white text-sm">{request.name}</p>
                          <p className="text-xs text-text-muted">{request.service}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button className="flex-1 bg-primary hover:bg-green-400 text-primary-content text-xs font-bold py-2 px-3 rounded-lg transition-colors">
                          Aceitar
                        </button>
                        <button className="flex-1 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 text-xs font-bold py-2 px-3 rounded-lg transition-colors">
                          Recusar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div>
              <h3 className="text-lg font-bold text-text-main dark:text-white mb-4">Acesso Rápido</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: 'person_add', label: 'Novo Cliente', color: 'blue' },
                  { icon: 'block', label: 'Bloquear Horário', color: 'purple' },
                  { icon: 'inventory_2', label: 'Estoque', color: 'orange' },
                  { icon: 'chat', label: 'Mensagens', color: 'teal' },
                ].map((action, idx) => (
                  <button
                    key={idx}
                    className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 hover:border-primary/50 dark:hover:border-primary/50 transition-all group"
                  >
                    <div
                      className={`w-10 h-10 rounded-full bg-${action.color}-50 dark:bg-${action.color}-900/20 text-${action.color}-600 dark:text-${action.color}-400 flex items-center justify-center group-hover:scale-110 transition-transform`}
                    >
                      <span className="material-symbols-outlined">{action.icon}</span>
                    </div>
                    <span className="text-xs font-bold text-text-main dark:text-gray-200">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        )}
      </div>
    </>
  )
}

export default Dashboard

