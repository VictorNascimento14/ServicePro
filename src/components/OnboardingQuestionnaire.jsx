import { useState } from 'react'
import { useUser } from '@clerk/clerk-react'
import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useNavigate } from 'react-router-dom'

function OnboardingQuestionnaire() {
  const { user } = useUser()
  const navigate = useNavigate()
  const updateUserProfile = useMutation(api.users.updateUserProfile)

  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState({
    userName: '',
    userType: '',
    businessName: '',
    services: [],
    experience: '',
    location: '',
    phone: '',
    preferences: [],
    availability: ''
  })

  const questions = [
    {
      id: 'userName',
      title: 'Como você gostaria de ser chamado?',
      subtitle: 'Queremos deixar sua experiência mais personalizada',
      type: 'text',
      placeholder: 'Ex: João, Maria, Pedro...'
    },
    {
      id: 'userType',
      title: 'Qual o seu perfil?',
      subtitle: 'Isso nos ajuda a personalizar sua experiência',
      type: 'radio',
      options: [
        { value: 'business', label: 'Tenho um estabelecimento (Dono)', icon: 'store' },
        { value: 'barber', label: 'Sou barbeiro/profissional (Funcionário)', icon: 'content_cut' },
        { value: 'client', label: 'Sou cliente', icon: 'person' }
      ]
    },
    {
      id: 'businessName',
      title: 'Nome do seu negócio',
      subtitle: 'Como seu estabelecimento é conhecido?',
      type: 'text',
      placeholder: 'Ex: Barbearia do João',
      condition: (answers) => answers.userType === 'business'
    },
    {
      id: 'services',
      title: 'Quais serviços você domina?',
      subtitle: 'Selecione todas as suas habilidades',
      type: 'checkbox',
      options: [
        { value: 'haircut', label: 'Corte de cabelo' },
        { value: 'beard', label: 'Barba' },
        { value: 'haircut-beard', label: 'Corte + Barba' },
        { value: 'hair-coloring', label: 'Coloração' },
        { value: 'hair-treatment', label: 'Tratamentos' },
        { value: 'other', label: 'Outros' }
      ],
      condition: (answers) => answers.userType === 'business' || answers.userType === 'barber'
    },
    {
      id: 'experience',
      title: 'Há quanto tempo trabalha na área?',
      subtitle: 'Sua experiência nos ajuda a conectar com os melhores clientes',
      type: 'radio',
      options: [
        { value: 'beginner', label: 'Menos de 1 ano' },
        { value: 'intermediate', label: '1-3 anos' },
        { value: 'experienced', label: '3-5 anos' },
        { value: 'expert', label: 'Mais de 5 anos' }
      ],
      condition: (answers) => answers.userType === 'business' || answers.userType === 'barber'
    },
    {
      id: 'location',
      title: 'Onde você está localizado?',
      subtitle: 'Cidade e estado para conexões locais',
      type: 'text',
      placeholder: 'Ex: São Paulo, SP',
      condition: (answers) => answers.userType === 'business' || answers.userType === 'barber'
    },
    {
      id: 'phone',
      title: 'Telefone para contato',
      subtitle: 'Para clientes entrarem em contato diretamente',
      type: 'tel',
      placeholder: '(11) 99999-9999'
    },
    {
      id: 'preferences',
      title: 'Quais estilos você prefere?',
      subtitle: 'Isso nos ajuda a mostrar os profissionais ideais',
      type: 'checkbox',
      options: [
        { value: 'classic', label: 'Clássico/Tradicionais' },
        { value: 'modern', label: 'Moderno/Contemporâneo' },
        { value: 'vintage', label: 'Retrô/Vintage' },
        { value: 'creative', label: 'Criativos/Artesanais' },
        { value: 'fast', label: 'Rápidos/Práticos' }
      ],
      condition: (answers) => answers.userType === 'client'
    },
    {
      id: 'availability',
      title: 'Quando você costuma agendar?',
      subtitle: 'Para encontrarmos os melhores horários',
      type: 'checkbox',
      options: [
        { value: 'weekdays', label: 'Segunda a Sexta' },
        { value: 'weekends', label: 'Finais de semana' },
        { value: 'mornings', label: 'Manhãs' },
        { value: 'afternoons', label: 'Tardes' },
        { value: 'evenings', label: 'Noites' }
      ],
      condition: (answers) => answers.userType === 'client'
    }
  ]

  const filteredQuestions = questions.filter(q => !q.condition || q.condition(answers))
  const currentQuestion = filteredQuestions[currentStep]
  const progress = ((currentStep + 1) / filteredQuestions.length) * 100

  const handleAnswer = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }))
  }

  const handleNext = () => {
    if (currentStep < filteredQuestions.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = async () => {
    try {
      // Preparar dados - remover campos undefined
      const profileData = {
        clerkId: user.id,
        userType: answers.userType,
        services: answers.services || [],
        preferences: answers.preferences || [],
        onboardingCompleted: true,
        isOwner: answers.userType === 'business' // Apenas donos de estabelecimento
      }
      
      // Adicionar campos opcionais apenas se tiverem valor
      if (answers.userName && answers.userName.trim()) {
        profileData.userName = answers.userName.trim()
      }
      if (answers.businessName && answers.businessName.trim()) {
        profileData.businessName = answers.businessName.trim()
      }
      if (answers.experience) {
        profileData.experience = answers.experience
      }
      if (answers.location && answers.location.trim()) {
        profileData.location = answers.location.trim()
      }
      if (answers.phone && answers.phone.trim()) {
        profileData.phone = answers.phone.trim()
      }
      if (answers.availability) {
        profileData.availability = Array.isArray(answers.availability) 
          ? answers.availability.join(', ') 
          : answers.availability
      }
      
      console.log('Enviando dados:', profileData)
      
      await updateUserProfile(profileData)
      console.log('Perfil salvo com sucesso!')
      
      // Redirect to dashboard
      navigate('/')
    } catch (error) {
      console.error('Erro completo:', error)
      alert('Erro ao salvar perfil. Por favor, tente novamente.')
    }
  }

  const renderQuestion = () => {
    if (!currentQuestion) return null

    switch (currentQuestion.type) {
      case 'radio':
        return (
          <div className="space-y-4">
            {currentQuestion.options.map((option) => (
              <label
                key={option.value}
                className="flex items-center p-4 bg-surface-dark border border-gray-700 rounded-xl cursor-pointer hover:border-primary/50 transition-colors"
              >
                <input
                  type="radio"
                  name={currentQuestion.id}
                  value={option.value}
                  checked={answers[currentQuestion.id] === option.value}
                  onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
                  className="mr-4 text-primary"
                />
                <div className="flex items-center gap-3">
                  {option.icon && (
                    <span className="material-symbols-outlined text-primary">{option.icon}</span>
                  )}
                  <span className="text-white font-medium">{option.label}</span>
                </div>
              </label>
            ))}
          </div>
        )

      case 'checkbox':
        return (
          <div className="space-y-3">
            {currentQuestion.options.map((option) => (
              <label
                key={option.value}
                className="flex items-center p-3 bg-surface-dark border border-gray-700 rounded-lg cursor-pointer hover:border-primary/50 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={answers[currentQuestion.id]?.includes(option.value) || false}
                  onChange={(e) => {
                    const currentValues = answers[currentQuestion.id] || []
                    const newValues = e.target.checked
                      ? [...currentValues, option.value]
                      : currentValues.filter(v => v !== option.value)
                    handleAnswer(currentQuestion.id, newValues)
                  }}
                  className="mr-3 text-primary"
                />
                <span className="text-white">{option.label}</span>
              </label>
            ))}
          </div>
        )

      case 'text':
      case 'tel':
        return (
          <input
            type={currentQuestion.type}
            placeholder={currentQuestion.placeholder}
            value={answers[currentQuestion.id] || ''}
            onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleNext()
              }
            }}
            className="w-full p-4 bg-surface-dark border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            autoFocus
          />
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-green-950 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary flex items-center justify-center shadow-lg">
            <span className="material-symbols-outlined text-3xl text-primary-content">person_add</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">ServicePro</h1>
          <p className="text-gray-300">Vamos configurar seu perfil</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>Passo {currentStep + 1} de {filteredQuestions.length}</span>
            <span>{Math.round(progress)}% completo</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-surface-dark p-8 rounded-2xl shadow-xl border border-gray-700 mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">{currentQuestion.title}</h2>
          <p className="text-gray-300 mb-6">{currentQuestion.subtitle}</p>

          {renderQuestion()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors"
          >
            Voltar
          </button>

          <button
            onClick={handleNext}
            disabled={
              currentQuestion.id === 'phone' ? false : (
                !answers[currentQuestion.id] ||
                (Array.isArray(answers[currentQuestion.id]) && answers[currentQuestion.id].length === 0)
              )
            }
            className="px-6 py-3 bg-primary hover:bg-primary-dark disabled:bg-gray-600 disabled:cursor-not-allowed text-primary-content rounded-xl font-bold shadow-lg shadow-primary/25 transition-all duration-300 hover:shadow-xl hover:scale-105"
          >
            {currentStep === filteredQuestions.length - 1 ? 'Finalizar' : 'Próximo'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default OnboardingQuestionnaire