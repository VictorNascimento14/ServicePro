import { useNavigate } from 'react-router-dom'
import { useUser, useClerk } from '@clerk/clerk-react'

function WelcomePage() {
  const navigate = useNavigate()
  const { user } = useUser()
  const { signOut } = useClerk()

  return (
    <div className="min-h-screen bg-green-950">
      {/* Botão de Sair se estiver logado */}
      {user && (
        <div className="absolute top-4 right-4">
          <button
            onClick={() => signOut()}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium text-sm shadow-md transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">logout</span>
            Sair
          </button>
        </div>
      )}
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Logo e Título */}
          <div className="mb-12">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-primary flex items-center justify-center shadow-lg">
              <span className="material-symbols-outlined text-4xl text-primary-content">content_cut</span>
            </div>
            <h1 className="text-5xl font-bold text-white mb-4">
              ServicePro
            </h1>
            <p className="text-xl text-gray-200 mb-2">
              Portal do Parceiro
            </p>
            <p className="text-lg text-gray-300">
              Sistema completo para gestão de agendamentos e clientes
            </p>
          </div>

          {/* Cards de Recursos */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-surface-dark p-6 rounded-xl shadow-lg border border-gray-700">
              <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl text-primary">calendar_today</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Agendamento Inteligente
              </h3>
              <p className="text-gray-300">
                Gerencie horários, evite conflitos e otimize sua agenda
              </p>
            </div>

            <div className="bg-surface-dark p-6 rounded-xl shadow-lg border border-gray-700">
              <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl text-primary">group</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Gestão de Clientes
              </h3>
              <p className="text-gray-300">
                Mantenha o histórico completo e preferências de cada cliente
              </p>
            </div>

            <div className="bg-surface-dark p-6 rounded-xl shadow-lg border border-gray-700">
              <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl text-primary">payments</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Controle Financeiro
              </h3>
              <p className="text-gray-300">
                Acompanhe receitas, pagamentos e relatórios detalhados
              </p>
            </div>
          </div>

          {/* Seção de Benefícios */}
          <div className="bg-surface-dark p-8 rounded-2xl shadow-xl border border-gray-700 mb-12">
            <h2 className="text-3xl font-bold text-white mb-6">
              Por que escolher ServicePro?
            </h2>
            <div className="grid md:grid-cols-2 gap-6 text-left">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-primary mt-1">check_circle</span>
                <div>
                  <h4 className="font-semibold text-white">Interface Intuitiva</h4>
                  <p className="text-gray-300">Fácil de usar, mesmo para quem não é expert em tecnologia</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-primary mt-1">check_circle</span>
                <div>
                  <h4 className="font-semibold text-white">Acesso 24/7</h4>
                  <p className="text-gray-300">Gerencie seu negócio de qualquer lugar, a qualquer hora</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-primary mt-1">check_circle</span>
                <div>
                  <h4 className="font-semibold text-white">Relatórios Detalhados</h4>
                  <p className="text-gray-300">Insights valiosos para crescer seu negócio</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-primary mt-1">check_circle</span>
                <div>
                  <h4 className="font-semibold text-white">Suporte Especializado</h4>
                  <p className="text-gray-300">Equipe pronta para ajudar quando precisar</p>
                </div>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Comece agora mesmo!
            </h2>
            <p className="text-xl text-gray-200 mb-8">
              Cadastre-se gratuitamente e transforme a gestão do seu negócio
            </p>
            <button
              onClick={() => navigate('/auth')}
              className="bg-primary hover:bg-primary-dark text-primary-content px-8 py-4 rounded-xl font-bold text-lg shadow-lg shadow-primary/25 transition-all duration-300 hover:shadow-xl hover:scale-105"
            >
              Entrar no ServicePro
            </button>
            <p className="text-sm text-gray-300 mt-4">
              Ao se cadastrar, você concorda com nossos termos de uso
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WelcomePage