import { SignIn, SignUp } from '@clerk/clerk-react'
import { ptBR } from '@clerk/localizations'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false)
  const navigate = useNavigate()

  return (
    <div className="min-h-screen dark:!bg-[#050a14] bg-background-light flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 animated-gradient particles-bg"></div>
      
      {/* Floating Orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl animate-pulse-slow"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-400/3 rounded-full blur-3xl animate-pulse-slow" style={{animationDelay: '1s'}}></div>
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]" style={{
        backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
                         linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)`,
        backgroundSize: '50px 50px'
      }}></div>
      
      {/* Animated Dots */}
      <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-white/10 rounded-full animate-ping"></div>
      <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-white/8 rounded-full animate-ping" style={{animationDelay: '1s'}}></div>
      <div className="absolute bottom-1/3 left-1/3 w-2 h-2 bg-white/10 rounded-full animate-ping" style={{animationDelay: '2s'}}></div>
      
      {/* Geometric Shapes */}
      <div className="absolute top-20 right-20 w-32 h-32 border border-white/5 rounded-lg rotate-12 animate-float"></div>
      <div className="absolute bottom-32 left-20 w-40 h-40 border border-white/5 rounded-full animate-float" style={{animationDelay: '1s'}}></div>
      
      <div className="max-w-md w-full relative z-10">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in-down">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-primary/10 backdrop-blur-xl border border-primary/20 flex items-center justify-center shadow-2xl shadow-primary/20 animate-float">
            <span className="material-symbols-outlined text-4xl text-primary">content_cut</span>
          </div>
          <h1 className="text-4xl font-display font-bold text-text-main-light dark:text-white mb-3 tracking-wide">ServicePro</h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">Entre na sua conta</p>
        </div>

        {/* Clerk Auth Components */}
        <div className="bg-surface-light dark:bg-surface-dark/80 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 hover:shadow-white/10 hover:border-white/20 hover:scale-[1.02] transition-all duration-700 animate-fade-in-up relative group overflow-hidden">
          {/* Animated Border Gradient */}
          <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/10 via-white/5 to-white/10 blur-xl"></div>
          </div>
          
          {/* Floating Particles on Hover */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-white/20 rounded-full animate-ping" style={{animationDelay: '0s'}}></div>
            <div className="absolute top-1/2 right-1/3 w-1 h-1 bg-white/15 rounded-full animate-ping" style={{animationDelay: '0.3s'}}></div>
            <div className="absolute bottom-1/3 left-1/2 w-1 h-1 bg-white/20 rounded-full animate-ping" style={{animationDelay: '0.6s'}}></div>
          </div>
          
          {/* Glow Effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-white/0 via-white/3 to-white/0 rounded-2xl opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-700 -z-10"></div>
          
          <div className="relative z-10">
          {!isSignUp ? (
            <SignIn
              fallbackRedirectUrl="/"
              localization={ptBR}
              appearance={{
                baseTheme: undefined,
                layout: {
                  socialButtonsPlacement: 'bottom',
                  socialButtonsVariant: 'blockButton',
                },
                variables: {
                  colorPrimary: '#13ec80',
                  colorBackground: 'transparent',
                  colorInputBackground: '#0a1020',
                  colorInputText: '#ffffff',
                  colorText: '#ffffff',
                  colorTextSecondary: '#9ca3af',
                  borderRadius: '0.75rem',
                  colorDanger: '#ef4444'
                },
                elements: {
                  formButtonPrimary: 'bg-primary hover:bg-primary-dark text-white shadow-lg hover:shadow-primary/30 transition-all font-semibold',
                  formButtonReset: 'bg-gray-600 hover:bg-gray-700 text-white',
                  card: 'bg-transparent border-none shadow-none p-0',
                  rootBox: 'bg-transparent',
                  headerTitle: 'text-white text-2xl font-bold',
                  headerSubtitle: 'text-gray-300',
                  socialButtonsBlockButton: 'bg-[#0d1526] hover:bg-[#1a2844] border-white/10 text-white transition-all shadow-md',
                  socialButtonsBlockButtonText: 'text-white font-medium',
                  dividerLine: 'bg-white/10',
                  dividerText: 'text-gray-400',
                  formFieldLabel: 'text-gray-300 font-medium',
                  formFieldInput: 'bg-[#0a1020] border-white/10 text-white placeholder-gray-500 focus:border-primary focus:ring-primary transition-all shadow-sm',
                  formFieldInputShowPasswordButton: 'text-gray-400 hover:text-white',
                  footerActionLink: 'text-primary hover:text-primary-dark font-medium',
                  footerActionText: 'text-gray-400',
                  identityPreviewEditButton: 'text-gray-400 hover:text-white',
                  identityPreviewText: 'text-white',
                  identityPreviewEditButtonIcon: 'text-gray-400',
                  formFieldSuccessText: 'text-primary',
                  formFieldErrorText: 'text-red-400',
                  formFieldWarningText: 'text-yellow-400',
                  alert: 'bg-red-900/20 border-red-700 text-red-200',
                  alertText: 'text-red-200',
                  tagInputContainer: 'bg-[#0a1020] border-white/10',
                  tagPill: 'bg-gray-600 text-white',
                  tagPillIcon: 'text-gray-400',
                  navbar: 'bg-[#0d1526] border-white/10',
                  navbarButton: 'text-gray-300 hover:text-white hover:bg-white/5',
                  pageScrollBox: 'bg-transparent',
                  page: 'bg-transparent',
                  footer: 'bg-transparent',
                  footerPages: 'bg-transparent'
                }
              }}
            />
          ) : (
            <SignUp
              fallbackRedirectUrl="/"
              localization={ptBR}
              appearance={{
                baseTheme: undefined,
                layout: {
                  socialButtonsPlacement: 'bottom',
                  socialButtonsVariant: 'blockButton',
                },
                variables: {
                  colorPrimary: '#13ec80',
                  colorBackground: 'transparent',
                  colorInputBackground: '#0a1020',
                  colorInputText: '#ffffff',
                  colorText: '#ffffff',
                  colorTextSecondary: '#9ca3af',
                  borderRadius: '0.75rem',
                  colorDanger: '#ef4444'
                },
                elements: {
                  formButtonPrimary: 'bg-primary hover:bg-primary-dark text-white shadow-lg hover:shadow-primary/30 transition-all font-semibold',
                  formButtonReset: 'bg-gray-600 hover:bg-gray-700 text-white',
                  card: 'bg-transparent border-none shadow-none p-0',
                  rootBox: 'bg-transparent',
                  headerTitle: 'text-white text-2xl font-bold',
                  headerSubtitle: 'text-gray-300',
                  socialButtonsBlockButton: 'bg-[#0d1526] hover:bg-[#1a2844] border-white/10 text-white transition-all shadow-md',
                  socialButtonsBlockButtonText: 'text-white font-medium',
                  dividerLine: 'bg-white/10',
                  dividerText: 'text-gray-400',
                  formFieldLabel: 'text-gray-300 font-medium',
                  formFieldInput: 'bg-[#0a1020] border-white/10 text-white placeholder-gray-500 focus:border-primary focus:ring-primary transition-all shadow-sm',
                  formFieldInputShowPasswordButton: 'text-gray-400 hover:text-white',
                  footerActionLink: 'text-primary hover:text-primary-dark font-medium',
                  footerActionText: 'text-gray-400',
                  identityPreviewEditButton: 'text-gray-400 hover:text-white',
                  identityPreviewText: 'text-white',
                  identityPreviewEditButtonIcon: 'text-gray-400',
                  formFieldSuccessText: 'text-primary',
                  formFieldErrorText: 'text-red-400',
                  formFieldWarningText: 'text-yellow-400',
                  alert: 'bg-red-900/20 border-red-700 text-red-200',
                  alertText: 'text-red-200',
                  tagInputContainer: 'bg-[#0a1020] border-white/10',
                  tagPill: 'bg-gray-600 text-white',
                  tagPillIcon: 'text-gray-400',
                  navbar: 'bg-[#0d1526] border-white/10',
                  navbarButton: 'text-gray-300 hover:text-white hover:bg-white/5',
                  pageScrollBox: 'bg-transparent',
                  page: 'bg-transparent',
                  footer: 'bg-transparent',
                  footerPages: 'bg-transparent'
                }
              }}
            />
          )}
          </div>
          
          {/* Toggle entre Sign In e Sign Up */}
          <div className="mt-6 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-primary hover:text-primary-dark text-sm font-medium transition-all"
            >
              {isSignUp ? 'Já tem uma conta? Faça login' : 'Não tem conta? Cadastre-se'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 animate-fade-in">
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Ao se cadastrar, você concorda com nossos{' '}
            <a href="#" className="text-primary hover:text-primary-dark underline transition-colors">
              termos de uso
            </a>
          </p>
        </div>
        
        {/* Botão Voltar */}
        <div className="flex justify-center mt-6">
          <button
            onClick={() => navigate('/welcome')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-gray-400 hover:text-white transition-all duration-300 group animate-fade-in backdrop-blur-sm"
          >
            <span className="material-symbols-outlined group-hover:-translate-x-1 transition-transform duration-300">arrow_back</span>
            <span className="font-medium">Voltar</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default AuthPage