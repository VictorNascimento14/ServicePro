import PageHeader from '../../components/PageHeader'
import { useState } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'

function Barbearias() {
  const [searchFilter, setSearchFilter] = useState('')
  
  const barbearias = useQuery(api.users.getBarbearias, { city: '' })

  // Filtrar localmente por cidade, bairro ou endereço
  const filteredBarbearias = barbearias?.filter(barbearia => {
    if (!searchFilter) return true
    
    const search = searchFilter.toLowerCase()
    const location = (barbearia.location || '').toLowerCase()
    const neighborhood = (barbearia.neighborhood || '').toLowerCase()
    const address = (barbearia.address || '').toLowerCase()
    
    return location.includes(search) || 
           neighborhood.includes(search) || 
           address.includes(search)
  })

  return (
    <div className="space-y-6">
      <PageHeader title="Barbearias" subtitle="Encontre as melhores barbearias perto de você" />
      
      {/* Filtro de busca */}
      <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary">search</span>
          <input
            type="text"
            placeholder="Buscar por cidade, bairro ou endereço..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-text-main dark:text-white placeholder-gray-400"
          />
          {searchFilter && (
            <button
              onClick={() => setSearchFilter('')}
              className="text-gray-400 hover:text-gray-600"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          )}
        </div>
      </div>

      {/* Lista de barbearias */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {barbearias === undefined ? (
          <div className="col-span-full text-center py-8">
            <p className="text-text-muted dark:text-gray-400">Carregando...</p>
          </div>
        ) : filteredBarbearias.length === 0 ? (
          <div className="col-span-full bg-white dark:bg-surface-dark rounded-xl shadow-sm p-8 border border-gray-200 dark:border-gray-800">
            <div className="text-center">
              <span className="material-symbols-outlined text-gray-300 dark:text-gray-600 text-5xl mb-4 block">store</span>
              <h3 className="text-lg font-semibold text-text-main dark:text-white mb-2">
                Nenhuma barbearia encontrada
              </h3>
              <p className="text-text-muted dark:text-gray-400">
                {searchFilter 
                  ? `Não encontramos barbearias com "${searchFilter}". Tente outra busca.`
                  : 'Ainda não há barbearias cadastradas.'}
              </p>
            </div>
          </div>
        ) : (
          filteredBarbearias.map((barbearia) => (
            <div
              key={barbearia._id}
              className="bg-white dark:bg-surface-dark rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-800 hover:border-primary dark:hover:border-primary transition-all hover:shadow-lg"
            >
              {/* Header com nome */}
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-primary text-2xl">store</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-text-main dark:text-white truncate">
                    {barbearia.businessName || 'Barbearia'}
                  </h3>
                  <p className="text-sm text-text-muted dark:text-gray-400">
                    {barbearia.userType === 'business' ? 'Estabelecimento' : 'Profissional Autônomo'}
                  </p>
                </div>
              </div>

              {/* Localização */}
              {(barbearia.location || barbearia.neighborhood || barbearia.address) && (
                <div className="mb-3 space-y-1">
                  {barbearia.location && (
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-gray-400 text-sm">location_city</span>
                      <span className="text-sm text-text-muted dark:text-gray-400">{barbearia.location}</span>
                    </div>
                  )}
                  {barbearia.neighborhood && (
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-gray-400 text-sm">home_pin</span>
                      <span className="text-sm text-text-muted dark:text-gray-400">{barbearia.neighborhood}</span>
                    </div>
                  )}
                  {barbearia.address && (
                    <div className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-gray-400 text-sm">place</span>
                      <span className="text-sm text-text-muted dark:text-gray-400">{barbearia.address}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Telefone */}
              {barbearia.phone && (
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-gray-400 text-sm">phone</span>
                  <span className="text-sm text-text-muted dark:text-gray-400">{barbearia.phone}</span>
                </div>
              )}

              {/* Serviços */}
              {barbearia.services && barbearia.services.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-text-muted dark:text-gray-400 mb-2">Serviços:</p>
                  <div className="flex flex-wrap gap-1">
                    {barbearia.services.slice(0, 3).map((service, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                      >
                        {service === 'haircut' ? 'Corte' :
                         service === 'beard' ? 'Barba' :
                         service === 'haircut-beard' ? 'Corte + Barba' :
                         service === 'hair-coloring' ? 'Coloração' :
                         service === 'hair-treatment' ? 'Tratamentos' : service}
                      </span>
                    ))}
                    {barbearia.services.length > 3 && (
                      <span className="px-2 py-1 text-text-muted dark:text-gray-400 text-xs">
                        +{barbearia.services.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Experiência */}
              {barbearia.experience && (
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-gray-400 text-sm">workspace_premium</span>
                  <span className="text-sm text-text-muted dark:text-gray-400">
                    {barbearia.experience === 'beginner' ? 'Menos de 1 ano' :
                     barbearia.experience === 'intermediate' ? '1-3 anos' :
                     barbearia.experience === 'experienced' ? '3-5 anos' :
                     barbearia.experience === 'expert' ? 'Mais de 5 anos' : barbearia.experience}
                  </span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Barbearias
