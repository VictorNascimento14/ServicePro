import { useParams } from 'react-router-dom'
import PageHeader from '../components/PageHeader'

function ClienteDetalhes() {
  const { id } = useParams()

  return (
    <>
      <PageHeader title={`Cliente #${id}`} subtitle="Detalhes do cliente" />
      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
          <h2 className="text-xl font-bold text-text-main dark:text-white mb-4">Detalhes do Cliente</h2>
          <p className="text-text-muted">Página de detalhes do cliente em desenvolvimento...</p>
        </div>
      </div>
    </>
  )
}

export default ClienteDetalhes


