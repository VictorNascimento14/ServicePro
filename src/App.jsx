import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'
import { useQuery } from 'convex/react'
import { api } from '../convex/_generated/api'

import { ThemeProvider } from './contexts/ThemeContext'
import DashboardLayout from './layouts/DashboardLayout'
import OnboardingQuestionnaire from './components/OnboardingQuestionnaire'
import WelcomePage from './pages/WelcomePage'
import AuthPage from './pages/AuthPage'
import Dashboard from './pages/Dashboard'
import Agenda from './pages/Agenda'
import Clientes from './pages/Clientes'
import ClienteDetalhes from './pages/ClienteDetalhes'
import Servicos from './pages/Servicos'
import Financeiro from './pages/Financeiro'
import Configuracoes from './pages/Configuracoes'
import EditarPerfil from './pages/EditarPerfil'
import SolicitarVinculo from './pages/SolicitarVinculo'
import SolicitacoesVinculo from './pages/SolicitacoesVinculo'

// Páginas de cliente
import ClienteDashboard from './pages/client/ClienteDashboard'
import Agendar from './pages/client/Agendar'
import Historico from './pages/client/Historico'
import Barbearias from './pages/client/Barbearias'

function AppContent() {
  const { user, isLoaded } = useUser()
  const userProfile = useQuery(api.users.getUserProfile, user ? { clerkId: user.id } : { clerkId: "" })

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-green-950 flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    )
  }

  // Se usuário não está logado, permite acesso às páginas públicas
  if (!user) {
    return (
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="*" element={<WelcomePage />} />
      </Routes>
    )
  }

  // Se usuário está logado mas não completou onboarding, mostra questionário
  if (!userProfile?.onboardingCompleted) {
    return (
      <Routes>
        <Route path="/onboarding" element={<OnboardingQuestionnaire />} />
        <Route path="*" element={<OnboardingQuestionnaire />} />
      </Routes>
    )
  }

  // Se é funcionário (barber sem isOwner) e não está vinculado, mostra tela de solicitar vínculo
  const isEmployee = userProfile?.userType === 'barber' && !userProfile?.isOwner
  if (isEmployee && !userProfile?.linkedToOwnerId) {
    return (
      <Routes>
        <Route path="*" element={<SolicitarVinculo />} />
      </Routes>
    )
  }

  // Se usuário está logado e completou onboarding, mostra dashboard
  // Rotas diferentes para clientes e profissionais
  const isClient = userProfile?.userType === 'client'
  
  return (
    <Routes>
      <Route path="/" element={<DashboardLayout />}>
        {isClient ? (
          // Rotas para clientes
          <>
            <Route index element={<ClienteDashboard />} />
            <Route path="agendar" element={<Agendar />} />
            <Route path="historico" element={<Historico />} />
            <Route path="barbearias" element={<Barbearias />} />
            <Route path="configuracoes" element={<Configuracoes />} />
            <Route path="editar-perfil" element={<EditarPerfil />} />
          </>
        ) : (
          // Rotas para profissionais/estabelecimentos
          <>
            <Route index element={<Dashboard />} />
            <Route path="agenda" element={<Agenda />} />
            <Route path="clientes" element={<Clientes />} />
            <Route path="clientes/:id" element={<ClienteDetalhes />} />
            <Route path="servicos" element={<Servicos />} />
            <Route path="financeiro" element={<Financeiro />} />
            <Route path="solicitacoes" element={<SolicitacoesVinculo />} />
            <Route path="configuracoes" element={<Configuracoes />} />
            <Route path="editar-perfil" element={<EditarPerfil />} />
          </>
        )}
      </Route>
    </Routes>
  )
}

function App() {
  return (
    <ThemeProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AppContent />
      </Router>
    </ThemeProvider>
  )
}

export default App

