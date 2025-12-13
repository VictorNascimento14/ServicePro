import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader'

function Clientes() {
  return (
    <>
      <PageHeader title="Clientes" subtitle="Gerencie sua base de clientes" />
      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
          <h2 className="text-xl font-bold text-text-main dark:text-white mb-4">Lista de Clientes</h2>
          <p className="text-text-muted mb-4">Página de clientes em desenvolvimento...</p>
          <Link to="/clientes/1" className="text-primary hover:underline">
            Ver exemplo de detalhes do cliente
          </Link>
        </div>
      </div>
    </>
  )
}

export default Clientes

