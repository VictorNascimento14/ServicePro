import PageHeader from '../../components/PageHeader'

function Agendar() {
  return (
    <div className="space-y-6">
      <PageHeader title="Agendar Horário" subtitle="Reserve seu horário com seu barbeiro favorito" />
      
      <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-800">
        <h2 className="text-lg font-semibold text-text-main dark:text-white mb-4">
          Em desenvolvimento
        </h2>
        <p className="text-text-muted dark:text-gray-400">
          Em breve você poderá agendar seus horários diretamente aqui!
        </p>
      </div>
    </div>
  )
}

export default Agendar
