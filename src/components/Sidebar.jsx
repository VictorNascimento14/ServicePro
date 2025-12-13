import { Link } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'

function Sidebar({ currentPath }) {
  const { isDark, toggleTheme } = useTheme()
  const menuItems = [
    { icon: 'dashboard', label: 'Dashboard', path: '/' },
    { icon: 'calendar_today', label: 'Agenda', path: '/agenda' },
    { icon: 'group', label: 'Clientes', path: '/clientes' },
    { icon: 'content_cut', label: 'Serviços', path: '/servicos' },
    { icon: 'payments', label: 'Financeiro', path: '/financeiro' },
  ]

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

        <div className="mt-4 flex items-center justify-between px-3">
          <span className="text-sm font-medium text-text-muted dark:text-gray-400">Tema</span>
          <button
            onClick={toggleTheme}
            className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 dark:bg-gray-700 transition-colors duration-500 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white dark:bg-gray-200 transition-transform duration-500 ${
                isDark ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
            <span className="absolute left-1 text-xs text-gray-500 dark:text-gray-400 transition-colors duration-500">
              {isDark ? '🌙' : '☀️'}
            </span>
          </button>
        </div>

        <div className="mt-4 flex items-center gap-3 px-3">
          <div
            className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 ring-2 ring-primary/20"
            style={{
              backgroundImage:
                'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBkxdMCsUSae2X4zyWR-qGZD7HR24dRvyZGe-GeIK52OInxnmJLtub4pfIpaMOlcbNbXV64J4imo4x94pZs_N5vRV204jNaiIMybw2cXLyk_CKt1vftRBOSIlayZVKI5mrCvqo4xq2o44EZXryEPkeAlzC4vY8iDHJzMrq7trZ5bLH5YO7GJNu1GOrPXCoHb83hbx8LCOhawLGD3OBDn8zbRxQx5etgAgMMQYhY905RDZWl2O_0EWqML9GP2UqttG4P6pMnqmhFfqo")',
            }}
          />
          <div className="flex flex-col">
            <p className="text-sm font-bold text-text-main dark:text-white">Marcos Silva</p>
            <p className="text-xs text-text-muted">Barbearia VIP</p>
          </div>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar

