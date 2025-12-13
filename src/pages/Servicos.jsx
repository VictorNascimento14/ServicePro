function Servicos() {
  return (
    <div className="min-h-screen bg-green-950">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-primary flex items-center justify-center shadow-lg">
              <span className="material-symbols-outlined text-4xl text-primary-content">content_cut</span>
            </div>
            <h1 className="text-5xl font-bold text-white mb-4">
              ServicePro
            </h1>
            <p className="text-xl text-gray-200 mb-2">
              Gestão de Serviços
            </p>
            <p className="text-lg text-gray-300">
              Gerencie seus serviços, preços e categorias de forma eficiente
            </p>
          </div>

          {/* Cards de Ações Principais */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-surface-dark p-6 rounded-xl shadow-lg border border-gray-700 hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl text-primary">add_circle</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2 text-center">
                Novo Serviço
              </h3>
              <p className="text-gray-300 text-center mb-4">
                Adicione um novo serviço ao seu catálogo
              </p>
              <button className="w-full bg-primary hover:bg-primary-dark text-primary-content py-2 px-4 rounded-lg font-medium transition-colors">
                Adicionar Serviço
              </button>
            </div>

            <div className="bg-surface-dark p-6 rounded-xl shadow-lg border border-gray-700 hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl text-primary">category</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2 text-center">
                Categorias
              </h3>
              <p className="text-gray-300 text-center mb-4">
                Organize seus serviços por categorias
              </p>
              <button className="w-full bg-primary hover:bg-primary-dark text-primary-content py-2 px-4 rounded-lg font-medium transition-colors">
                Gerenciar Categorias
              </button>
            </div>

            <div className="bg-surface-dark p-6 rounded-xl shadow-lg border border-gray-700 hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl text-primary">attach_money</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2 text-center">
                Preços
              </h3>
              <p className="text-gray-300 text-center mb-4">
                Configure preços e promoções
              </p>
              <button className="w-full bg-primary hover:bg-primary-dark text-primary-content py-2 px-4 rounded-lg font-medium transition-colors">
                Ajustar Preços
              </button>
            </div>
          </div>

          {/* Lista de Serviços */}
          <div className="bg-surface-dark p-8 rounded-2xl shadow-xl border border-gray-700 mb-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-white">
                Meus Serviços
              </h2>
              <button className="bg-primary hover:bg-primary-dark text-primary-content px-6 py-3 rounded-xl font-bold shadow-lg shadow-primary/25 transition-all duration-300 hover:shadow-xl hover:scale-105">
                + Novo Serviço
              </button>
            </div>

            {/* Estado vazio ou lista de serviços */}
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-4xl text-primary">inventory</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Nenhum serviço cadastrado
              </h3>
              <p className="text-gray-300 mb-6">
                Comece adicionando seu primeiro serviço para organizar seu negócio
              </p>
              <button className="bg-primary hover:bg-primary-dark text-primary-content px-8 py-3 rounded-xl font-bold shadow-lg shadow-primary/25 transition-all duration-300 hover:shadow-xl hover:scale-105">
                Adicionar Primeiro Serviço
              </button>
            </div>
          </div>

          {/* Estatísticas */}
          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-surface-dark p-6 rounded-xl shadow-lg border border-gray-700 text-center">
              <div className="text-3xl font-bold text-primary mb-2">0</div>
              <div className="text-gray-300">Serviços Ativos</div>
            </div>
            <div className="bg-surface-dark p-6 rounded-xl shadow-lg border border-gray-700 text-center">
              <div className="text-3xl font-bold text-primary mb-2">0</div>
              <div className="text-gray-300">Categorias</div>
            </div>
            <div className="bg-surface-dark p-6 rounded-xl shadow-lg border border-gray-700 text-center">
              <div className="text-3xl font-bold text-primary mb-2">R$ 0,00</div>
              <div className="text-gray-300">Receita Estimada</div>
            </div>
            <div className="bg-surface-dark p-6 rounded-xl shadow-lg border border-gray-700 text-center">
              <div className="text-3xl font-bold text-primary mb-2">0</div>
              <div className="text-gray-300">Agendamentos Hoje</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Servicos

