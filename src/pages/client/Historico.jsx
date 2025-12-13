import PageHeader from '../../components/PageHeader'

function Historico() {
  return (
    <div className="space-y-6">
      <PageHeader title="Meu Histórico" subtitle="Veja todos os seus cortes e avaliações" />
      
      <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-800">
        <h2 className="text-lg font-semibold text-text-main dark:text-white mb-4">
          Nenhum histórico ainda
        </h2>
        <p className="text-text-muted dark:text-gray-400">
          Quando você fizer seu primeiro agendamento, o histórico aparecerá aqui!
        </p>
      </div>
    </div>
  )
}

export default Historico
