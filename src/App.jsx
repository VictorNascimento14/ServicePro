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

  // Se usuário está logado e completou onboarding, mostra dashboard
  return (
    <Routes>
      <Route path="/" element={<DashboardLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="agenda" element={<Agenda />} />
        <Route path="clientes" element={<Clientes />} />
        <Route path="clientes/:id" element={<ClienteDetalhes />} />
        <Route path="servicos" element={<Servicos />} />
        <Route path="financeiro" element={<Financeiro />} />
        <Route path="configuracoes" element={<Configuracoes />} />
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

