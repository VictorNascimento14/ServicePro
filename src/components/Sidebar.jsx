import { Link } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'
import { useUser, useClerk } from '@clerk/clerk-react'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useState } from 'react'

function Sidebar({ currentPath }) {
  const { isDark } = useTheme()
  const { user } = useUser()
  const { signOut } = useClerk()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [hoveredItem, setHoveredItem] = useState(null)
  
  // Buscar perfil do usuário
  const userProfile = useQuery(api.users.getUserProfile, user ? { clerkId: user.id } : "skip")
  const businessSettings = useQuery(api.services.getBusinessSettings, user ? { ownerId: user.id } : "skip")
  
  // Se é funcionário, buscar perfil do owner vinculado
  const linkedOwnerProfile = useQuery(
    api.users.getLinkedOwnerProfile, 
    userProfile?.linkedToOwnerId ? { linkedToOwnerId: userProfile.linkedToOwnerId } : "skip"
  )
  
  // Nome do usuário e negócio
  const userName = userProfile?.userName || user?.firstName || user?.fullName?.split(' ')[0] || 'Usuário'
  const businessName = userProfile?.userType === 'client' 
    ? 'Cliente' 
    : (linkedOwnerProfile?.businessName || userProfile?.businessName || businessSettings?.businessName || 'Sua Barbearia')
  
  // Menu items baseado no tipo de usuário
  const menuItemsProfessional = [
    { icon: 'dashboard', label: 'Dashboard', path: '/' },
    { icon: 'calendar_today', label: 'Agenda', path: '/agenda' },
    { icon: 'group', label: 'Clientes', path: '/clientes' },
    { icon: 'content_cut', label: 'Serviços', path: '/servicos' },
    { icon: 'payments', label: 'Financeiro', path: '/financeiro' },
  ]
  
  // Adicionar "Solicitações" apenas para donos de estabelecimento
  if (userProfile?.isOwner) {
    menuItemsProfessional.push({ icon: 'pending_actions', label: 'Solicitações', path: '/solicitacoes' })
  }
  
  const menuItemsClient = [
    { icon: 'home', label: 'Início', path: '/' },
    { icon: 'event', label: 'Agendar Horário', path: '/agendar' },
    { icon: 'history', label: 'Meu Histórico', path: '/historico' },
    { icon: 'store', label: 'Barbearias', path: '/barbearias' },
  ]
  
  const menuItems = userProfile?.userType === 'client' ? menuItemsClient : menuItemsProfessional

  const isActive = (path) => {
    if (path === '/') {
      return currentPath === '/'
    }
    return currentPath.startsWith(path)
  }

  return (
    <div 
      className="hidden md:flex h-full relative group"
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {/* Barra com gradiente verde que expande */}
      <aside className={`flex flex-col h-full bg-gradient-to-b from-emerald-900 via-emerald-950 to-black transition-all duration-300 relative rounded-tr-xl rounded-br-xl overflow-visible ${
        isExpanded ? 'w-64' : 'w-20'
      }`}>
        {/* Logo no topo */}
        <div className="p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white shadow-lg flex-shrink-0">
            <span className="material-symbols-outlined text-[28px]">content_cut</span>
          </div>
          {isExpanded && (
            <div className="overflow-hidden">
              <h1 className="text-base font-bold text-white whitespace-nowrap">ServicePro</h1>
              <p className="text-xs text-white/80 whitespace-nowrap">{businessName}</p>
            </div>
          )}
        </div>

        {/* Menu items */}
        <nav className="flex-1 overflow-y-auto pl-3 pr-0 py-6 space-y-2">
          {menuItems.map((item, index) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 h-12 transition-all duration-300 ${
                isActive(item.path)
                  ? isExpanded
                    ? 'bg-white dark:bg-gray-900 text-emerald-700 dark:text-emerald-400 rounded-l-[2rem] shadow-lg font-semibold pl-3 pr-6'
                    : 'bg-white dark:bg-gray-900 text-emerald-700 dark:text-emerald-400 rounded-full w-14 justify-center mx-auto'
                  : 'text-white hover:bg-white/10 rounded-2xl mx-3 px-3'
              }`}
            >
              <span
                className={`material-symbols-outlined text-[24px] flex-shrink-0 transition-all ${
                  isActive(item.path) ? "font-bold" : ""
                }`}
                style={isActive(item.path) ? { fontVariationSettings: "'FILL' 1, 'wght' 600" } : {}}
              >
                {item.icon}
              </span>
              {isExpanded && (
                <span className="text-sm font-medium whitespace-nowrap overflow-hidden">
                  {item.label}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* Ícones inferiores */}
        <div className="pl-3 pr-0 py-3 space-y-2 border-t border-white/10">
          <Link
            to="/configuracoes"
            className={`flex items-center gap-3 h-12 transition-all duration-300 ${
              currentPath === '/configuracoes'
                ? isExpanded
                  ? 'bg-white dark:bg-gray-900 text-emerald-700 dark:text-emerald-400 rounded-l-[2rem] shadow-lg font-semibold pl-3 pr-6'
                  : 'bg-white dark:bg-gray-900 text-emerald-700 dark:text-emerald-400 rounded-full w-14 justify-center mx-auto'
                : 'text-white hover:bg-white/10 rounded-2xl mx-3 px-3'
            }`}
          >
            <span className="material-symbols-outlined text-[24px] flex-shrink-0">settings</span>
            {isExpanded && (
              <span className="text-sm font-medium whitespace-nowrap overflow-hidden">
                Configurações
              </span>
            )}
          </Link>

          <button
            onClick={() => {
              const html = document.documentElement
              if (html.classList.contains('dark')) {
                html.classList.remove('dark')
                localStorage.setItem('theme', 'light')
              } else {
                html.classList.add('dark')
                localStorage.setItem('theme', 'dark')
              }
            }}
            className="flex items-center gap-3 h-12 px-3 mx-3 text-white hover:bg-white/10 rounded-2xl transition-all duration-300 w-auto"
          >
            <span className="material-symbols-outlined text-[24px] flex-shrink-0">
              {document.documentElement.classList.contains('dark') ? 'light_mode' : 'dark_mode'}
            </span>
            {isExpanded && (
              <span className="text-sm font-medium whitespace-nowrap overflow-hidden">
                {document.documentElement.classList.contains('dark') ? 'Modo Claro' : 'Modo Escuro'}
              </span>
            )}
          </button>

          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 h-12 px-3 mx-3 text-white hover:bg-white/10 rounded-2xl transition-all duration-300 w-auto relative"
          >
            <div
              className="bg-center bg-no-repeat aspect-square bg-cover rounded-full w-9 h-9 ring-2 ring-white/30 flex-shrink-0"
              style={{
                backgroundImage: user?.imageUrl 
                  ? `url("${user.imageUrl}")`
                  : 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBkxdMCsUSae2X4zyWR-qGZD7HR24dRvyZGe-GeIK52OInxnmJLtub4pfIpaMOlcbNbXV64J4imo4x94pZs_N5vRV204jNaiIMybw2cXLyk_CKt1vftRBOSIlayZVKI5mrCvqo4xq2o44EZXryEPkeAlzC4vY8iDHJzMrq7trZ5bLH5YO7GJNu1GOrPXCoHb83hbx8LCOhawLGD3OBDn8zbRxQx5etgAgMMQYhY905RDZWl2O_0EWqML9GP2UqttG4P6pMnqmhFfqo")',
              }}
            />
            {isExpanded && (
              <div className="flex flex-col overflow-hidden">
                <p className="text-sm font-semibold text-white whitespace-nowrap overflow-hidden text-ellipsis">{userName}</p>
              </div>
            )}
          </button>
        </div>
      </aside>

      {/* Menu do usuário (popup) */}
      {showUserMenu && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={() => setShowUserMenu(false)}
          />
          <div className="absolute bottom-20 left-4 w-72 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 z-40">
            <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div
                  className="bg-center bg-no-repeat aspect-square bg-cover rounded-full w-12 h-12 ring-2 ring-emerald-500/30"
                  style={{
                    backgroundImage: user?.imageUrl 
                      ? `url("${user.imageUrl}")`
                      : 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBkxdMCsUSae2X4zyWR-qGZD7HR24dRvyZGe-GeIK52OInxnmJLtub4pfIpaMOlcbNbXV64J4imo4x94pZs_N5vRV204jNaiIMybw2cXLyk_CKt1vftRBOSIlayZVKI5mrCvqo4xq2o44EZXryEPkeAlzC4vY8iDHJzMrq7trZ5bLH5YO7GJNu1GOrPXCoHb83hbx8LCOhawLGD3OBDn8zbRxQx5etgAgMMQYhY905RDZWl2O_0EWqML9GP2UqttG4P6pMnqmhFfqo")',
                  }}
                />
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{userName}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user?.primaryEmailAddress?.emailAddress}</p>
                </div>
              </div>
            </div>

            <Link
              to="/configuracoes"
              onClick={() => setShowUserMenu(false)}
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
            >
              <span className="material-symbols-outlined text-gray-600 dark:text-gray-400 text-[20px]">settings</span>
              <span className="text-sm text-gray-900 dark:text-white font-medium">Configurações</span>
            </Link>

            <Link
              to="/editar-perfil"
              onClick={() => setShowUserMenu(false)}
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
            >
              <span className="material-symbols-outlined text-gray-600 dark:text-gray-400 text-[20px]">person</span>
              <span className="text-sm text-gray-900 dark:text-white font-medium">Editar Perfil</span>
            </Link>

            <button
              onClick={() => {
                setShowUserMenu(false)
                window.open('https://accounts.clerk.dev/user', '_blank')
              }}
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors w-full text-left"
            >
              <span className="material-symbols-outlined text-gray-600 dark:text-gray-400 text-[20px]">lock</span>
              <span className="text-sm text-gray-900 dark:text-white font-medium">Segurança</span>
            </button>

            <div className="border-t border-gray-200 dark:border-gray-700 mt-2 pt-2">
              <button
                onClick={() => {
                  setShowUserMenu(false)
                  signOut()
                }}
                className="flex items-center gap-3 px-4 py-3 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full text-left rounded-lg mx-2"
              >
                <span className="material-symbols-outlined text-red-500 text-[20px]">logout</span>
                <span className="text-sm text-red-500 font-medium">Sair</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default Sidebar

