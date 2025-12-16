import React from 'react'
import ReactDOM from 'react-dom/client'
import { ConvexReactClient } from 'convex/react'
import { ConvexProvider } from 'convex/react'
import { ClerkProvider } from '@clerk/clerk-react'
import App from './App.jsx'
import './styles/index.css'

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL)

// Import your Publishable Key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error('Add your Clerk Publishable Key to the .env file')
}

// Clerk appearance configuration
const clerkAppearance = {
  baseTheme: undefined,
  layout: {
    socialButtonsPlacement: 'bottom',
    socialButtonsVariant: 'blockButton',
    termsPageUrl: 'https://clerk.com/terms'
  },
  variables: {
    colorPrimary: '#16a34a', // green-600
    colorBackground: '#14532d', // green-950
    colorInputBackground: '#1f2937', // gray-800
    colorInputText: '#ffffff', // white
    colorText: '#ffffff', // white
    colorTextSecondary: '#d1d5db', // gray-300
    borderRadius: '0.75rem'
  },
  elements: {
    formButtonPrimary: 'bg-green-600 hover:bg-green-700 text-white shadow-lg',
    formButtonReset: 'bg-gray-600 hover:bg-gray-700 text-white',
    card: 'bg-gray-800 border border-gray-700 shadow-2xl',
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
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      appearance={clerkAppearance}
    >
      <ConvexProvider client={convex}>
        <App />
      </ConvexProvider>
    </ClerkProvider>
  </React.StrictMode>,
)


