import { SignIn, SignUp } from '@clerk/clerk-react'
import { useState } from 'react'

function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false)

  return (
    <div className="min-h-screen bg-green-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary flex items-center justify-center shadow-lg">
            <span className="material-symbols-outlined text-3xl text-primary-content">content_cut</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">ServicePro</h1>
          <p className="text-gray-300">Entre na sua conta</p>
        </div>

        {/* Clerk Auth Components */}
        <div className="bg-surface-dark p-8 rounded-2xl shadow-xl border border-gray-700">
          {!isSignUp ? (
            <SignIn
              fallbackRedirectUrl="/"
              appearance={{
                baseTheme: undefined,
                layout: {
                  socialButtonsPlacement: 'bottom',
                  socialButtonsVariant: 'blockButton',
                },
                variables: {
                  colorPrimary: '#16a34a',
                  colorBackground: '#1f2937',
                  colorInputBackground: '#374151',
                  colorInputText: '#ffffff',
                  colorText: '#ffffff',
                  colorTextSecondary: '#d1d5db',
                  borderRadius: '0.75rem'
                },
                elements: {
                  formButtonPrimary: 'bg-green-600 hover:bg-green-700 text-white shadow-lg',
                  formButtonReset: 'bg-gray-600 hover:bg-gray-700 text-white',
                  card: 'bg-transparent border-none shadow-none p-0',
                  headerTitle: 'text-white text-2xl font-bold',
                  headerSubtitle: 'text-gray-300',
                  socialButtonsBlockButton: 'bg-gray-700 hover:bg-gray-600 border-gray-600 text-white',
                  socialButtonsBlockButtonText: 'text-white font-medium',
                  dividerLine: 'bg-gray-600',
                  dividerText: 'text-gray-400',
                  formFieldLabel: 'text-gray-200 font-medium',
                  formFieldInput: 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-green-500 focus:ring-green-500',
                  formFieldInputShowPasswordButton: 'text-gray-400 hover:text-white',
                  footerActionLink: 'text-green-400 hover:text-green-300',
                  footerActionText: 'text-gray-400',
                  identityPreviewEditButton: 'text-gray-400 hover:text-white',
                  identityPreviewText: 'text-white',
                  identityPreviewEditButtonIcon: 'text-gray-400',
                  formFieldSuccessText: 'text-green-400',
                  formFieldErrorText: 'text-red-400',
                  alert: 'bg-red-900 border-red-700 text-red-200',
                  alertText: 'text-red-200',
                  tagInputContainer: 'bg-gray-700 border-gray-600',
                  tagPill: 'bg-gray-600 text-white',
                  tagPillIcon: 'text-gray-400',
                  navbar: 'bg-gray-800 border-gray-700',
                  navbarButton: 'text-gray-300 hover:text-white hover:bg-gray-700',
                  pageScrollBox: 'bg-green-950',
                  page: 'bg-green-950'
                }
              }}
            />
          ) : (
            <SignUp
              fallbackRedirectUrl="/"
              appearance={{
                baseTheme: undefined,
                layout: {
                  socialButtonsPlacement: 'bottom',
                  socialButtonsVariant: 'blockButton',
                },
                variables: {
                  colorPrimary: '#16a34a',
                  colorBackground: '#1f2937',
                  colorInputBackground: '#374151',
                  colorInputText: '#ffffff',
                  colorText: '#ffffff',
                  colorTextSecondary: '#d1d5db',
                  borderRadius: '0.75rem'
                },
                elements: {
                  formButtonPrimary: 'bg-green-600 hover:bg-green-700 text-white shadow-lg',
                  formButtonReset: 'bg-gray-600 hover:bg-gray-700 text-white',
                  card: 'bg-transparent border-none shadow-none p-0',
                  headerTitle: 'text-white text-2xl font-bold',
                  headerSubtitle: 'text-gray-300',
                  socialButtonsBlockButton: 'bg-gray-700 hover:bg-gray-600 border-gray-600 text-white',
                  socialButtonsBlockButtonText: 'text-white font-medium',
                  dividerLine: 'bg-gray-600',
                  dividerText: 'text-gray-400',
                  formFieldLabel: 'text-gray-200 font-medium',
                  formFieldInput: 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-green-500 focus:ring-green-500',
                  formFieldInputShowPasswordButton: 'text-gray-400 hover:text-white',
                  footerActionLink: 'text-green-400 hover:text-green-300',
                  footerActionText: 'text-gray-400',
                  identityPreviewEditButton: 'text-gray-400 hover:text-white',
                  identityPreviewText: 'text-white',
                  identityPreviewEditButtonIcon: 'text-gray-400',
                  formFieldSuccessText: 'text-green-400',
                  formFieldErrorText: 'text-red-400',
                  alert: 'bg-red-900 border-red-700 text-red-200',
                  alertText: 'text-red-200',
                  tagInputContainer: 'bg-gray-700 border-gray-600',
                  tagPill: 'bg-gray-600 text-white',
                  tagPillIcon: 'text-gray-400',
                  navbar: 'bg-gray-800 border-gray-700',
                  navbarButton: 'text-gray-300 hover:text-white hover:bg-gray-700',
                  pageScrollBox: 'bg-green-950',
                  page: 'bg-green-950'
                }
              }}
            />
          )}
          
          {/* Toggle entre Sign In e Sign Up */}
          <div className="mt-6 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-green-400 hover:text-green-300 text-sm underline"
            >
              {isSignUp ? 'Já tem uma conta? Faça login' : 'Não tem conta? Cadastre-se'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-gray-400 text-sm">
            Ao se cadastrar, você concorda com nossos{' '}
            <a href="#" className="text-green-400 hover:text-green-300 underline">
              termos de uso
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default AuthPage