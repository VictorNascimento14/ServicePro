import PageHeader from '../components/PageHeader'

function Financeiro() {
  return (
    <>
      <PageHeader title="Financeiro" subtitle="Relatórios e análises financeiras" />
      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
          <h2 className="text-xl font-bold text-text-main dark:text-white mb-4">Relatórios Financeiros</h2>
          <p className="text-text-muted">Página financeira em desenvolvimento...</p>
        </div>
      </div>
    </>
  )
}

export default Financeiro


