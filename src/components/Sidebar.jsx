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
    <aside className="hidden md:flex flex-col w-64 h-full bg-surface-light dark:bg-surface-dark border-r border-gray-200 dark:border-gray-800 transition-colors duration-500">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-content">
          <span className="material-symbols-outlined text-[24px]">content_cut</span>
        </div>
        <div>
          <h1 className="text-lg font-bold leading-none tracking-tight text-text-main dark:text-white transition-colors duration-500">ServicePro</h1>
          <p className="text-xs text-text-muted dark:text-gray-400 mt-1 transition-colors duration-500">Portal do Parceiro</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-3 py-3 rounded-lg font-medium group transition-all ${
              isActive(item.path)
                ? 'bg-primary/20 text-green-900 dark:text-primary'
                : 'text-text-muted dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-text-main dark:hover:text-gray-200'
            }`}
          >
            <span
              className="material-symbols-outlined"
              style={isActive(item.path) ? { fontVariationSettings: "'FILL' 1" } : {}}
            >
              {item.icon}
            </span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-100 dark:border-gray-800">
        <Link
          to="/configuracoes"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-muted dark:text-gray-400 hover:text-text-main dark:hover:text-white transition-colors"
        >
          <span className="material-symbols-outlined">settings</span>
          <span className="text-sm font-medium">Configurações</span>
        </Link>

        <div className="mt-4 flex items-center gap-3 px-3 relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 w-full hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-lg p-2 transition-colors"
          >
            <div
              className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 ring-2 ring-primary/20"
              style={{
                backgroundImage: user?.imageUrl 
                  ? `url("${user.imageUrl}")`
                  : 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBkxdMCsUSae2X4zyWR-qGZD7HR24dRvyZGe-GeIK52OInxnmJLtub4pfIpaMOlcbNbXV64J4imo4x94pZs_N5vRV204jNaiIMybw2cXLyk_CKt1vftRBOSIlayZVKI5mrCvqo4xq2o44EZXryEPkeAlzC4vY8iDHJzMrq7trZ5bLH5YO7GJNu1GOrPXCoHb83hbx8LCOhawLGD3OBDn8zbRxQx5etgAgMMQYhY905RDZWl2O_0EWqML9GP2UqttG4P6pMnqmhFfqo")',
              }}
            />
            <div className="flex flex-col flex-1 text-left">
              <p className="text-sm font-bold text-text-main dark:text-white">{userName}</p>
              <p className="text-xs text-text-muted">{businessName}</p>
            </div>
            <span className="material-symbols-outlined text-text-muted text-sm">
              {showUserMenu ? 'expand_less' : 'expand_more'}
            </span>
          </button>

          {/* Menu do usuário */}
          {showUserMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowUserMenu(false)}
              />
              <div className="absolute bottom-full left-3 right-3 mb-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-20">
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-semibold text-text-main dark:text-white">{userName}</p>
                  <p className="text-xs text-text-muted dark:text-gray-400">{user?.primaryEmailAddress?.emailAddress}</p>
                </div>

                <Link
                  to="/configuracoes"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <span className="material-symbols-outlined text-text-muted dark:text-gray-400 text-sm">settings</span>
                  <span className="text-sm text-text-main dark:text-white">Configurações</span>
                </Link>

                <Link
                  to="/editar-perfil"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <span className="material-symbols-outlined text-text-muted dark:text-gray-400 text-sm">person</span>
                  <span className="text-sm text-text-main dark:text-white">Editar Perfil</span>
                </Link>

                <button
                  onClick={() => {
                    setShowUserMenu(false)
                    window.open('https://accounts.clerk.dev/user', '_blank')
                  }}
                  className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors w-full text-left"
                >
                  <span className="material-symbols-outlined text-text-muted dark:text-gray-400 text-sm">lock</span>
                  <span className="text-sm text-text-main dark:text-white">Segurança</span>
                </button>

                <div className="border-t border-gray-200 dark:border-gray-700 mt-2 pt-2">
                  <button
                    onClick={() => {
                      setShowUserMenu(false)
                      signOut()
                    }}
                    className="flex items-center gap-3 px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full text-left"
                  >
                    <span className="material-symbols-outlined text-red-500 text-sm">logout</span>
                    <span className="text-sm text-red-500">Sair</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </aside>
  )
}

export default Sidebar

