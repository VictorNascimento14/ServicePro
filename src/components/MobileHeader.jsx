import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useUser, useClerk } from '@clerk/clerk-react'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'

function MobileHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [isOpening, setIsOpening] = useState(false)
  const location = useLocation()
  const { user } = useUser()
  const { signOut } = useClerk()
  
  const userProfile = useQuery(api.users.getUserProfile, user ? { clerkId: user.id } : "skip")
  const linkedOwnerProfile = useQuery(
    api.users.getLinkedOwnerProfile, 
    userProfile?.linkedToOwnerId ? { linkedToOwnerId: userProfile.linkedToOwnerId } : "skip"
  )
  
  const userName = userProfile?.userName || user?.firstName || user?.fullName?.split(' ')[0] || 'Usuário'
  
  // Menu items baseado no tipo de usuário
  const menuItemsProfessional = [
    { icon: 'dashboard', label: 'Dashboard', path: '/' },
    { icon: 'calendar_today', label: 'Agenda', path: '/agenda' },
    { icon: 'group', label: 'Clientes', path: '/clientes' },
    { icon: 'content_cut', label: 'Serviços', path: '/servicos' },
    { icon: 'payments', label: 'Financeiro', path: '/financeiro' },
  ]
  
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
      return location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }
  
  const handleOpenMenu = () => {
    setIsMenuOpen(true)
    setIsOpening(true)
    setTimeout(() => setIsOpening(false), 50)
  }
  
  const handleCloseMenu = () => {
    setIsClosing(true)
    setTimeout(() => {
      setIsMenuOpen(false)
      setIsClosing(false)
    }, 300)
  }
  
  return (
    <>
      <header className="md:hidden flex items-center justify-between p-4 bg-surface-light dark:bg-surface-dark border-b border-gray-200 dark:border-gray-800">
        <button 
          onClick={handleOpenMenu}
          className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
        >
          <span className="material-symbols-outlined text-text-main dark:text-white transition-colors duration-500">menu</span>
        </button>
        <span className="font-bold text-lg text-text-main dark:text-white transition-colors duration-500">ServicePro</span>
        <div className="flex items-center gap-3">
          {/* Dark Mode Toggle */}
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
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
          >
            <span className="material-symbols-outlined text-text-main dark:text-white text-xl">
              {document.documentElement.classList.contains('dark') ? 'light_mode' : 'dark_mode'}
            </span>
          </button>
          <div
            className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-8"
            style={{
              backgroundImage: user?.imageUrl 
                ? `url("${user.imageUrl}")`
                : 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCWUqv9wGPxzeP-MKpfwUjj2-3d-4MCgQYcTu_NNyIjLMLLwP7PF2jFA95Tnu9Y-HHBBzqkYn7EE7i2yBfdUIZhO94K4bRHlQAaLuNOMtsP4oX_hYIhJt-9QbbXC6g3ka7Sg3dMH2je3qAm26ld1sPxM_nF8k-z8w-wnnF9Px8UlGmgJ5g445MhmKBm1pNSQ7fXp9PjQgyuLr0dJEuA0pK2VwMT2OsUPGNjnb5DjxJm1by2k2s2bET4lvdxU-oI4yUr-94LAht2U44")',
            }}
          />
        </div>
      </header>
      
      {/* Menu Mobile Sidebar */}
      {isMenuOpen && (
        <>
          {/* Overlay */}
          <div 
            className={`fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300 ${
              isOpening ? 'opacity-0' : isClosing ? 'opacity-0' : 'opacity-100'
            }`}
            onClick={handleCloseMenu}
          />
          
          {/* Sidebar */}
          <div className={`fixed top-0 left-0 bottom-0 w-80 max-w-[85vw] bg-surface-light dark:bg-surface-dark z-50 md:hidden shadow-2xl transition-transform duration-300 ${
            isOpening ? '-translate-x-full' : isClosing ? '-translate-x-full' : 'translate-x-0'
          }`}>
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-content">
                      <span className="material-symbols-outlined text-[24px]">content_cut</span>
                    </div>
                    <div>
                      <h1 className="text-lg font-bold leading-none tracking-tight text-text-main dark:text-white">ServicePro</h1>
                      <p className="text-xs text-text-muted dark:text-gray-400 mt-1">Portal do Parceiro</p>
                    </div>
                  </div>
                  <button 
                    onClick={handleCloseMenu}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
                  >
                    <span className="material-symbols-outlined text-text-muted">close</span>
                  </button>
                </div>
                
                {/* User Info */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <div
                    className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 ring-2 ring-primary/20"
                    style={{
                      backgroundImage: user?.imageUrl 
                        ? `url("${user.imageUrl}")`
                        : 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBkxdMCsUSae2X4zyWR-qGZD7HR24dRvyZGe-GeIK52OInxnmJLtub4pfIpaMOlcbNbXV64J4imo4x94pZs_N5vRV204jNaiIMybw2cXLyk_CKt1vftRBOSIlayZVKI5mrCvqo4xq2o44EZXryEPkeAlzC4vY8iDHJzMrq7trZ5bLH5YO7GJNu1GOrPXCoHb83hbx8LCOhawLGD3OBDn8zbRxQx5etgAgMMQYhY905RDZWl2O_0EWqML9GP2UqttG4P6pMnqmhFfqo")',
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-text-main dark:text-white truncate">{userName}</p>
                    <p className="text-xs text-text-muted dark:text-gray-400 truncate">{user?.primaryEmailAddress?.emailAddress}</p>
                  </div>
                </div>
              </div>
              
              {/* Navigation */}
              <nav className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
                {menuItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={handleCloseMenu}
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg font-medium transition-all ${
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
              
              {/* Footer */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                <Link
                  to="/configuracoes"
                  onClick={handleCloseMenu}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-muted dark:text-gray-400 hover:text-text-main dark:hover:text-white transition-colors mb-2"
                >
                  <span className="material-symbols-outlined">settings</span>
                  <span className="text-sm font-medium">Configurações</span>
                </Link>
                
                <button
                  onClick={() => {
                    handleCloseMenu()
                    setTimeout(() => signOut(), 300)
                  }}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full text-left"
                >
                  <span className="material-symbols-outlined text-red-500">logout</span>
                  <span className="text-sm text-red-500 font-medium">Sair</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}

export default MobileHeader

