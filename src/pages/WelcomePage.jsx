import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'

// --- Components ---
const FeatureCard = ({ icon, title, description }) => (
  <div className="p-8 rounded-xl bg-surface-light dark:bg-surface-dark border border-gray-200 dark:border-white/10 shadow-lg hover:border-primary/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/20 group h-full relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    <div className="relative z-10">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-8 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
        <span className="material-symbols-outlined text-primary text-4xl group-hover:animate-pulse">{icon}</span>
      </div>
      <h3 className="font-display text-2xl text-text-main-light dark:text-white mb-4 font-semibold group-hover:text-primary transition-colors duration-300">{title}</h3>
      <p className="text-base text-text-muted-light dark:text-gray-300 leading-relaxed">
        {description}
      </p>
    </div>
  </div>
)

const BenefitItem = ({ title, description }) => (
  <div className="flex gap-5 items-start p-6 rounded-lg hover:bg-white/5 transition-all duration-300 hover:translate-x-2 group">
    <span className="material-symbols-outlined text-primary shrink-0 mt-1 text-3xl group-hover:scale-125 group-hover:rotate-12 transition-transform duration-300">check_circle</span>
    <div>
      <h4 className="font-bold text-text-main-light dark:text-white text-lg uppercase tracking-wider mb-3 group-hover:text-primary transition-colors duration-300">{title}</h4>
      <p className="text-base text-text-muted-light dark:text-gray-300 leading-relaxed">{description}</p>
    </div>
  </div>
)

// --- Main Component ---
function WelcomePage() {
  const navigate = useNavigate()
  const { user } = useUser()
  
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const [showFinancialView, setShowFinancialView] = useState(false)

  // Initialize Dark Mode and Handle HTML class
  useEffect(() => {
    const html = document.documentElement
    if (isDarkMode) {
      html.classList.add('dark')
    } else {
      html.classList.remove('dark')
    }
  }, [isDarkMode])

  // Handle Scroll Effect for Navbar and Parallax
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      setScrolled(currentScrollY > 50)
      setScrollY(currentScrollY)
    }
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode)
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen)

  return (
    <div className="w-full min-h-screen flex flex-col font-body animated-gradient particles-bg overflow-y-auto" style={{ scrollBehavior: 'smooth' }}>
      
      {/* Navigation */}
      <nav 
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          scrolled 
            ? 'bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-md py-4 shadow-lg border-b border-gray-200 dark:border-white/5' 
            : 'bg-transparent py-6'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-3xl md:text-4xl">content_cut</span>
            <span className={`font-display font-bold text-xl md:text-2xl tracking-wider ${scrolled ? 'text-text-main-light dark:text-white' : 'text-white'}`}>
              ServicePro
            </span>
          </div>

          {/* Desktop Menu */}
          <div className={`hidden md:flex items-center gap-8 ${scrolled ? 'text-text-main-light dark:text-white' : 'text-gray-200'}`}>
            <a href="#features" className="hover:text-primary transition-colors text-sm font-medium uppercase tracking-wide">Recursos</a>
            <a href="#why-choose" className="hover:text-primary transition-colors text-sm font-medium uppercase tracking-wide">Vantagens</a>
            <a href="#contact" className="hover:text-primary transition-colors text-sm font-medium uppercase tracking-wide">Contato</a>
          </div>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-4">
            <button 
              onClick={toggleDarkMode}
              className={`p-2 rounded-full transition-colors ${scrolled ? 'hover:bg-gray-200 dark:hover:bg-white/10 text-text-main-light dark:text-white' : 'bg-black/20 hover:bg-white/10 text-white backdrop-blur-sm'}`}
            >
              <span className="material-symbols-outlined">{isDarkMode ? 'light_mode' : 'dark_mode'}</span>
            </button>
            <button 
              onClick={() => navigate('/auth')}
              className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg font-bold text-sm uppercase tracking-wider transition-all transform hover:scale-105 shadow-lg shadow-primary/20"
            >
              Entrar
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-4 md:hidden">
             <button 
                onClick={toggleDarkMode}
                className={`p-2 rounded-full transition-colors ${scrolled ? 'text-text-main-light dark:text-white' : 'text-white bg-black/20'}`}
              >
                <span className="material-symbols-outlined text-xl">{isDarkMode ? 'light_mode' : 'dark_mode'}</span>
              </button>
            <button 
              onClick={toggleMobileMenu}
              className={`p-2 rounded-full transition-colors ${scrolled ? 'text-text-main-light dark:text-white' : 'text-white bg-black/20'}`}
            >
              <span className="material-symbols-outlined text-2xl">menu</span>
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="absolute top-full left-0 w-full bg-surface-light dark:bg-surface-dark border-b border-gray-200 dark:border-white/10 shadow-2xl p-6 flex flex-col gap-4 md:hidden animate-fade-in-up">
            <a href="#features" className="text-lg font-medium text-text-main-light dark:text-white py-2 border-b border-gray-100 dark:border-white/5" onClick={() => setIsMobileMenuOpen(false)}>Recursos</a>
            <a href="#why-choose" className="text-lg font-medium text-text-main-light dark:text-white py-2 border-b border-gray-100 dark:border-white/5" onClick={() => setIsMobileMenuOpen(false)}>Vantagens</a>
            <a href="#contact" className="text-lg font-medium text-text-main-light dark:text-white py-2 border-b border-gray-100 dark:border-white/5" onClick={() => setIsMobileMenuOpen(false)}>Contato</a>
            <button 
              onClick={() => navigate('/auth')}
              className="w-full bg-primary hover:bg-primary-dark text-white py-3 rounded-lg font-bold uppercase tracking-wider mt-2"
            >
              Entrar no Portal
            </button>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <header className="relative w-full min-h-screen flex items-center justify-center overflow-hidden snap-start snap-always">
        {/* Background Image with Parallax */}
        <div 
          className="absolute inset-0 z-0" 
          style={{ 
            transform: `translateY(${scrollY * 0.5}px)`,
            transition: 'transform 0.1s ease-out'
          }}
        >
          <img 
            src="https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=2574&auto=format&fit=crop" 
            alt="Barbershop Atmosphere" 
            className="w-full h-full object-cover"
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background-light via-transparent to-black/60 dark:from-background-dark dark:via-black/40 dark:to-black/80"></div>
          <div className="absolute inset-0 bg-black/30 dark:bg-black/60 mix-blend-multiply"></div>
        </div>

        {/* Hero Content */}
        <div 
          className="relative z-10 container mx-auto px-6 pt-20 text-center md:text-left md:flex md:items-center md:justify-between h-full"
          style={{ 
            opacity: Math.max(0, 1 - scrollY / 600),
            transform: `translateY(${scrollY * 0.2}px)`,
            transition: 'opacity 0.1s ease-out, transform 0.1s ease-out'
          }}
        >
           <div className="max-w-2xl mx-auto md:mx-0 animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6 shadow-xl glass-effect hover:scale-105 transition-transform duration-300">
                <span className="material-symbols-outlined text-primary text-xl animate-pulse">storefront</span>
                <span className="text-primary font-bold tracking-[0.15em] uppercase text-xs">Portal do Parceiro</span>
              </div>
              
              <h1 className="font-display text-5xl md:text-7xl lg:text-8xl text-white font-medium leading-[1.4] mb-8 drop-shadow-2xl px-2 py-2">
                Elevando o <br/> <span className="text-primary italic gradient-text animate-pulse inline-block px-3 py-1">Nível</span> do Seu Negócio
              </h1>
              
              <p className="text-gray-200 dark:text-gray-100 text-lg md:text-xl font-light leading-relaxed mb-10 max-w-lg mx-auto md:mx-0 drop-shadow-md text-balance">
                ServicePro é o sistema definitivo para gestão de barbearias e salões. Agendamentos, clientes e financeiro em um só lugar.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <button 
                  onClick={() => navigate('/auth')}
                  className="bg-primary hover:bg-primary-dark text-white font-bold py-4 px-8 rounded-xl uppercase tracking-widest text-sm transition-all transform hover:scale-110 shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/40 neon-glow relative overflow-hidden"
                >
                    Começar Agora
                </button>
                <button className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 font-bold py-4 px-8 rounded-xl uppercase tracking-widest text-sm transition-all hover:scale-105 glass-effect">
                    Saber Mais
                </button>
              </div>
           </div>

            {/* Floating Card for Desktop Visual Interest */}
           <div className="hidden lg:block relative z-10 animate-fade-in-up delay-200 animate-float">
              <div className="p-6 bg-surface-dark/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl max-w-sm transform rotate-3 hover:rotate-0 transition-transform duration-500 glass-effect hover:shadow-primary/20">
                  <div className="flex items-center gap-4 mb-4 border-b border-white/10 pb-4">
                      <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                          <span className="material-symbols-outlined text-white">notifications_active</span>
                      </div>
                      <div>
                          <p className="text-white font-display text-lg">Novo Agendamento</p>
                          <p className="text-gray-400 dark:text-gray-300 text-sm">Há 2 minutos</p>
                      </div>
                  </div>
                  <div className="space-y-3">
                      <div className="h-2 bg-white/10 rounded w-3/4"></div>
                      <div className="h-2 bg-white/10 rounded w-1/2"></div>
                  </div>
              </div>
           </div>
        </div>
      </header>

      {/* Features Section */}
      <section id="features" className="min-h-screen flex flex-col justify-center py-24 md:py-24 px-6 bg-background-light dark:!bg-[#050a14] snap-start snap-always relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-30">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse-slow" style={{animationDelay: '1s'}}></div>
        </div>
        <div className="max-w-7xl mx-auto w-full relative z-10">
            <div className="text-center mb-12 md:mb-16 max-w-4xl mx-auto animate-fade-in-down">
                <span className="text-primary text-base md:text-lg font-bold tracking-[0.2em] uppercase mb-6 block animate-fade-in">Funcionalidades</span>
                <h2 className="font-display text-4xl md:text-6xl lg:text-7xl text-text-main-light dark:text-white leading-tight mb-8">
                    Tudo que você precisa para <span className="gradient-text">crescer</span>
                </h2>
                <p className="text-text-muted-light dark:text-gray-300 text-xl md:text-2xl leading-relaxed">
                    Ferramentas poderosas desenhadas especificamente para o fluxo de trabalho de profissionais da beleza.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                <FeatureCard 
                    icon="calendar_month"
                    title="Agendamento Inteligente"
                    description="Gerencie horários, evite conflitos e otimize sua agenda de forma automática com lembretes via WhatsApp."
                />
                <FeatureCard 
                    icon="people"
                    title="Gestão de Clientes"
                    description="Mantenha o histórico completo, preferências de corte e frequência de visita de cada cliente organizados."
                />
                <FeatureCard 
                    icon="attach_money"
                    title="Controle Financeiro"
                    description="Acompanhe receitas, comissões, despesas e visualize relatórios de desempenho detalhados."
                />
                 <FeatureCard 
                    icon="smartphone"
                    title="App para Clientes"
                    description="Seus clientes agendam pelo próprio celular, sem precisar te ligar ou mandar mensagem."
                />
                 <FeatureCard 
                    icon="inventory_2"
                    title="Controle de Estoque"
                    description="Evite falta de produtos. Controle a entrada e saída de materiais e produtos para revenda."
                />
                 <FeatureCard 
                    icon="insights"
                    title="Dashboard Gerencial"
                    description="Tome decisões baseadas em dados com gráficos intuitivos sobre o crescimento do seu negócio."
                />
            </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section id="why-choose" className="min-h-screen flex flex-col justify-center bg-surface-light dark:!bg-[#0a1020] py-24 md:py-24 px-6 relative overflow-hidden border-y border-gray-200 dark:border-white/5 snap-start snap-always">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none transform translate-x-1/2 -translate-y-1/2 animate-pulse-slow"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none transform -translate-x-1/2 translate-y-1/2 animate-pulse-slow" style={{animationDelay: '2s'}}></div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]" style={{
          backgroundImage: 'linear-gradient(rgba(19, 236, 128, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(19, 236, 128, 0.5) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}></div>
        
        {/* Animated Dots */}
        <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-primary/30 rounded-full animate-ping"></div>
        <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-primary/20 rounded-full animate-ping" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-1/3 left-1/3 w-2 h-2 bg-primary/25 rounded-full animate-ping" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-2/3 right-1/4 w-3 h-3 bg-primary/30 rounded-full animate-ping" style={{animationDelay: '1.5s'}}></div>
        
        {/* Floating Geometric Shapes */}
        <div className="absolute top-20 left-10 w-32 h-32 border border-primary/10 rounded-lg rotate-12 animate-float"></div>
        <div className="absolute bottom-32 right-20 w-40 h-40 border border-primary/10 rounded-full animate-float" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 right-10 w-24 h-24 border border-primary/10 rotate-45 animate-float" style={{animationDelay: '2s'}}></div>
        
        {/* Gradient Lines */}
        <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-primary/10 to-transparent"></div>
        <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-primary/10 to-transparent"></div>
        
        <div className="max-w-7xl mx-auto w-full relative z-10 flex flex-col md:flex-row items-center gap-12 md:gap-16">
            <div className="md:w-1/2 animate-slide-in-left">
                 <span className="text-primary text-base md:text-lg font-bold tracking-[0.2em] uppercase mb-6 block">Diferenciais</span>
                 <h2 className="font-display text-4xl md:text-6xl lg:text-7xl text-text-main-light dark:text-white leading-tight mb-10">
                    Por que os <span className="gradient-text">melhores</span> escolhem o ServicePro?
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <BenefitItem title="Interface Intuitiva" description="Fácil de usar, mesmo para quem não é expert em tecnologia." />
                    <BenefitItem title="Acesso 24/7" description="Gerencie seu negócio de qualquer lugar, a qualquer hora, na nuvem." />
                    <BenefitItem title="Relatórios Detalhados" description="Insights valiosos para entender onde lucrar mais." />
                    <BenefitItem title="Suporte Especializado" description="Equipe pronta para ajudar via chat ou telefone." />
                </div>
            </div>
            
            <div className="md:w-1/2 w-full animate-slide-in-right">
                {/* Dashboard Mockup */}
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-200 dark:border-white/10 bg-surface-light dark:bg-surface-dark p-6 group hover:shadow-primary/20 transition-all duration-500">
                    {/* Dashboard Header */}
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-white/10">
                        <div>
                            <h3 className="font-display text-xl font-bold text-text-main-light dark:text-white">Dashboard Analytics</h3>
                            <p className="text-sm text-text-muted-light dark:text-gray-400">Visão geral do mês</p>
                        </div>
                        <div className="flex items-center gap-3">
                            {/* View Switch */}
                            <button
                                onClick={() => setShowFinancialView(!showFinancialView)}
                                className="relative inline-flex items-center h-7 w-14 rounded-full bg-gray-200 dark:bg-gray-700 transition-colors duration-300 focus:outline-none hover:bg-gray-300 dark:hover:bg-gray-600"
                            >
                                <span
                                    className={`inline-block h-5 w-5 transform rounded-full bg-primary transition-transform duration-300 ${
                                        showFinancialView ? 'translate-x-8' : 'translate-x-1'
                                    }`}
                                />
                            </button>
                            <div className="flex gap-2 items-center">
                                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-xs text-text-muted-light dark:text-gray-400">Ao vivo</span>
                            </div>
                        </div>
                    </div>
                    {/* Conditional Dashboard Views */}
                    {!showFinancialView ? (
                        <>                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-4 rounded-xl border border-primary/20 hover:scale-105 transition-transform duration-300 cursor-pointer group/card">
                            <p className="text-xs text-text-muted-light dark:text-gray-400 mb-1">Receita Mensal</p>
                            <p className="text-2xl font-bold text-text-main-light dark:text-white mb-1">R$ 12.5K</p>
                            <div className="flex items-center gap-1 text-xs text-green-500">
                                <span className="material-symbols-outlined text-sm">trending_up</span>
                                <span>+23%</span>
                            </div>
                        </div>
                        
                        <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 p-4 rounded-xl border border-blue-500/20 hover:scale-105 transition-transform duration-300 cursor-pointer group/card">
                            <p className="text-xs text-text-muted-light dark:text-gray-400 mb-1">Agendamentos</p>
                            <p className="text-2xl font-bold text-text-main-light dark:text-white mb-1">156</p>
                            <div className="flex items-center gap-1 text-xs text-green-500">
                                <span className="material-symbols-outlined text-sm">trending_up</span>
                                <span>+12%</span>
                            </div>
                        </div>
                    </div>

                    {/* Chart Area */}
                    <div className="bg-white/5 dark:bg-black/20 p-4 rounded-xl border border-gray-200 dark:border-white/10 mb-6">
                        <p className="text-sm font-semibold text-text-main-light dark:text-white mb-4">Receita Semanal</p>
                        <div className="flex items-end justify-between h-32 gap-2">
                            <div className="flex-1 bg-primary/30 hover:bg-primary/50 rounded-t-lg transition-all duration-300 cursor-pointer relative group/bar" style={{height: '60%'}}>
                                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 transition-opacity bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                                    R$ 1.8K
                                </div>
                            </div>
                            <div className="flex-1 bg-primary/30 hover:bg-primary/50 rounded-t-lg transition-all duration-300 cursor-pointer relative group/bar" style={{height: '80%'}}>
                                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 transition-opacity bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                                    R$ 2.4K
                                </div>
                            </div>
                            <div className="flex-1 bg-primary hover:bg-primary-dark rounded-t-lg transition-all duration-300 cursor-pointer relative group/bar animate-pulse" style={{height: '100%'}}>
                                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 transition-opacity bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                                    R$ 3.2K
                                </div>
                            </div>
                            <div className="flex-1 bg-primary/30 hover:bg-primary/50 rounded-t-lg transition-all duration-300 cursor-pointer relative group/bar" style={{height: '70%'}}>
                                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 transition-opacity bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                                    R$ 2.1K
                                </div>
                            </div>
                            <div className="flex-1 bg-primary/30 hover:bg-primary/50 rounded-t-lg transition-all duration-300 cursor-pointer relative group/bar" style={{height: '85%'}}>
                                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 transition-opacity bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                                    R$ 2.6K
                                </div>
                            </div>
                            <div className="flex-1 bg-primary/30 hover:bg-primary/50 rounded-t-lg transition-all duration-300 cursor-pointer relative group/bar" style={{height: '45%'}}>
                                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 transition-opacity bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                                    R$ 1.4K
                                </div>
                            </div>
                            <div className="flex-1 bg-primary/30 hover:bg-primary/50 rounded-t-lg transition-all duration-300 cursor-pointer relative group/bar" style={{height: '55%'}}>
                                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 transition-opacity bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                                    R$ 1.7K
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-between text-xs text-text-muted-light dark:text-gray-400 mt-2">
                            <span>Seg</span>
                            <span>Ter</span>
                            <span>Qua</span>
                            <span>Qui</span>
                            <span>Sex</span>
                            <span>Sáb</span>
                            <span>Dom</span>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="text-center p-3 bg-white/5 dark:bg-black/20 rounded-lg border border-gray-200 dark:border-white/10 hover:border-primary/50 transition-colors cursor-pointer">
                            <p className="text-lg font-bold text-text-main-light dark:text-white">89%</p>
                            <p className="text-xs text-text-muted-light dark:text-gray-400">Taxa de Retorno</p>
                        </div>
                        <div className="text-center p-3 bg-white/5 dark:bg-black/20 rounded-lg border border-gray-200 dark:border-white/10 hover:border-primary/50 transition-colors cursor-pointer">
                            <p className="text-lg font-bold text-text-main-light dark:text-white">4.8★</p>
                            <p className="text-xs text-text-muted-light dark:text-gray-400">Avaliação</p>
                        </div>
                        <div className="text-center p-3 bg-white/5 dark:bg-black/20 rounded-lg border border-gray-200 dark:border-white/10 hover:border-primary/50 transition-colors cursor-pointer">
                            <p className="text-lg font-bold text-text-main-light dark:text-white">342</p>
                            <p className="text-xs text-text-muted-light dark:text-gray-400">Clientes</p>
                        </div>
                    </div>
                    </>
                    ) : (
                        <>
                    {/* Financial View - Stats Cards */}
                    <div className="grid grid-cols-3 gap-3 mb-6">
                        <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 p-4 rounded-xl border border-green-500/20 hover:scale-105 transition-transform duration-300 cursor-pointer">
                            <p className="text-xs text-text-muted-light dark:text-gray-400 mb-1">Saldo</p>
                            <p className="text-xl font-bold text-green-500">R$ 990K</p>
                        </div>
                        <div className="bg-gradient-to-br from-red-500/10 to-red-500/5 p-4 rounded-xl border border-red-500/20 hover:scale-105 transition-transform duration-300 cursor-pointer">
                            <p className="text-xs text-text-muted-light dark:text-gray-400 mb-1">A Pagar</p>
                            <p className="text-xl font-bold text-red-500">-R$ 184K</p>
                        </div>
                        <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 p-4 rounded-xl border border-blue-500/20 hover:scale-105 transition-transform duration-300 cursor-pointer">
                            <p className="text-xs text-text-muted-light dark:text-gray-400 mb-1">A Receber</p>
                            <p className="text-xl font-bold text-blue-500">R$ 805K</p>
                        </div>
                    </div>

                    {/* Pie Charts */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        {/* Saldo a Receber Chart */}
                        <div className="bg-white/5 dark:bg-black/20 p-4 rounded-xl border border-gray-200 dark:border-white/10">
                            <p className="text-sm font-semibold text-text-main-light dark:text-white mb-4">Saldo a receber por mês</p>
                            <div className="relative w-full aspect-square">
                                <svg viewBox="0 0 100 100" className="transform -rotate-90">
                                    <circle cx="50" cy="50" r="40" fill="none" stroke="#3b82f6" strokeWidth="20" strokeDasharray="20 251" className="hover:stroke-width-[22] transition-all cursor-pointer" />
                                    <circle cx="50" cy="50" r="40" fill="none" stroke="#8b5cf6" strokeWidth="20" strokeDasharray="25 251" strokeDashoffset="-20" className="hover:stroke-width-[22] transition-all cursor-pointer" />
                                    <circle cx="50" cy="50" r="40" fill="none" stroke="#ec4899" strokeWidth="20" strokeDasharray="30 251" strokeDashoffset="-45" className="hover:stroke-width-[22] transition-all cursor-pointer" />
                                    <circle cx="50" cy="50" r="40" fill="none" stroke="#f59e0b" strokeWidth="20" strokeDasharray="35 251" strokeDashoffset="-75" className="hover:stroke-width-[22] transition-all cursor-pointer" />
                                    <circle cx="50" cy="50" r="40" fill="none" stroke="#10b981" strokeWidth="20" strokeDasharray="40 251" strokeDashoffset="-110" className="hover:stroke-width-[22] transition-all cursor-pointer" />
                                    <circle cx="50" cy="50" r="40" fill="none" stroke="#06b6d4" strokeWidth="20" strokeDasharray="45 251" strokeDashoffset="-150" className="hover:stroke-width-[22] transition-all cursor-pointer" />
                                    <circle cx="50" cy="50" r="40" fill="none" stroke="#6366f1" strokeWidth="20" strokeDasharray="56 251" strokeDashoffset="-195" className="hover:stroke-width-[22] transition-all cursor-pointer" />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-text-main-light dark:text-white">R$805K</p>
                                        <p className="text-xs text-text-muted-light dark:text-gray-400">Total</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Saldo a Pagar Chart */}
                        <div className="bg-white/5 dark:bg-black/20 p-4 rounded-xl border border-gray-200 dark:border-white/10">
                            <p className="text-sm font-semibold text-text-main-light dark:text-white mb-4">Saldo a pagar por mês</p>
                            <div className="relative w-full aspect-square">
                                <svg viewBox="0 0 100 100" className="transform -rotate-90">
                                    <circle cx="50" cy="50" r="40" fill="none" stroke="#ef4444" strokeWidth="20" strokeDasharray="40 251" className="hover:stroke-width-[22] transition-all cursor-pointer" />
                                    <circle cx="50" cy="50" r="40" fill="none" stroke="#f97316" strokeWidth="20" strokeDasharray="35 251" strokeDashoffset="-40" className="hover:stroke-width-[22] transition-all cursor-pointer" />
                                    <circle cx="50" cy="50" r="40" fill="none" stroke="#fb923c" strokeWidth="20" strokeDasharray="30 251" strokeDashoffset="-75" className="hover:stroke-width-[22] transition-all cursor-pointer" />
                                    <circle cx="50" cy="50" r="40" fill="none" stroke="#fbbf24" strokeWidth="20" strokeDasharray="25 251" strokeDashoffset="-105" className="hover:stroke-width-[22] transition-all cursor-pointer" />
                                    <circle cx="50" cy="50" r="40" fill="none" stroke="#fcd34d" strokeWidth="20" strokeDasharray="54 251" strokeDashoffset="-130" className="hover:stroke-width-[22] transition-all cursor-pointer" />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-text-main-light dark:text-white">R$184K</p>
                                        <p className="text-xs text-text-muted-light dark:text-gray-400">Total</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-xs">
                                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                <span className="text-text-muted-light dark:text-gray-400">Jan 2024</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                                <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                                <span className="text-text-muted-light dark:text-gray-400">Fev 2024</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                                <div className="w-3 h-3 rounded-full bg-pink-500"></div>
                                <span className="text-text-muted-light dark:text-gray-400">Mar 2024</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-xs">
                                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                                <span className="text-text-muted-light dark:text-gray-400">Abr 2024</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                <span className="text-text-muted-light dark:text-gray-400">Mai 2024</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                                <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
                                <span className="text-text-muted-light dark:text-gray-400">Jun 2024</span>
                            </div>
                        </div>
                    </div>
                    </>
                    )}

                    {/* Shimmer Effect on Hover */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent shimmer"></div>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="contact" className="min-h-screen flex flex-col justify-center py-24 px-6 bg-background-light dark:!bg-[#050a14] text-center relative overflow-hidden snap-start snap-always">
         <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-full bg-primary/10 blur-[150px] rounded-full pointer-events-none animate-pulse-slow"></div>
         <div className="absolute top-0 left-0 w-full h-full">
           <div className="absolute top-10 left-1/4 w-2 h-2 bg-primary/40 rounded-full animate-ping"></div>
           <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-primary/30 rounded-full animate-ping" style={{animationDelay: '1s'}}></div>
           <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-primary/40 rounded-full animate-ping" style={{animationDelay: '2s'}}></div>
         </div>
         
         <div className="max-w-6xl mx-auto space-y-14 relative z-10 animate-fade-in-up">
            <h2 className="font-display text-6xl md:text-8xl lg:text-9xl text-text-main-light dark:text-white leading-tight">
                Pronto para <span className="gradient-text animate-pulse">transformar</span> seu negócio?
            </h2>
            <p className="text-text-muted-light dark:text-gray-300 text-3xl md:text-4xl leading-relaxed max-w-4xl mx-auto">
                Junte-se a mais de 5.000 barbearias que já modernizaram sua gestão. Teste grátis por 14 dias, sem compromisso.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-6 pt-8">
                 <button 
                   onClick={() => navigate('/auth')}
                   className="bg-primary hover:bg-primary-dark text-white font-bold py-7 px-14 rounded-xl uppercase tracking-widest text-lg transition-all transform hover:scale-110 shadow-2xl shadow-primary/30 hover:shadow-primary/50 neon-glow"
                 >
                    Criar Conta Grátis
                </button>
                 <button className="bg-transparent border-2 border-gray-300 dark:border-white/20 hover:bg-gray-100 dark:hover:bg-white/5 text-text-main-light dark:text-white font-bold py-7 px-14 rounded-xl uppercase tracking-widest text-lg transition-all hover:scale-105 hover:border-primary">
                    Falar com Consultor
                </button>
            </div>
            <p className="text-sm text-text-muted-light dark:text-gray-400 pt-8">
                Não é necessário cartão de crédito para começar.
            </p>
         </div>
      </section>

      {/* Footer */}
      <footer className="dark:!bg-[#0a1020] bg-gray-800 text-white py-12 px-6 border-t border-white/5 snap-start">
        <div className="max-w-7xl mx-auto flex flex-col justify-center items-center gap-2 text-center">
             <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-widest">© 2025 ServicePro. Todos os direitos reservados.</p>
             <p className="text-xs text-gray-600 dark:text-gray-400">Feito com precisão.</p>
        </div>
      </footer>
    </div>
  )
}

export default WelcomePage