// Cache resources
// http://localhost:3000/isolated/exercise/04.js

import * as React from 'react'
import {
  fetchPokemon,
  PokemonInfoFallback,
  PokemonForm,
  PokemonDataView,
  PokemonErrorBoundary,
} from '../pokemon'
import {createResource} from '../utils'

function PokemonInfo({pokemonResource}) {
  const pokemon = pokemonResource.read()
  return (
    <div>
      <div className="pokemon-info__img-wrapper">
        <img src={pokemon.image} alt={pokemon.name} />
      </div>
      <PokemonDataView pokemon={pokemon} />
    </div>
  )
}

const SUSPENSE_CONFIG = {
  timeoutMs: 4000,
  busyDelayMs: 300,
  busyMinDurationMs: 700,
}

function createPokemonResource(pokemonName) {
  return createResource(fetchPokemon(pokemonName))
}

const CacheContext = React.createContext()
const usePokemonCache = () => React.useContext(CacheContext)

const PokemonCacheProvider = ({cacheTime = 5000, children}) => {
  const pokemonResourceCache = React.useRef({})

  const getPokemonResource = React.useCallback(
    pokemonName => {
      const lowerName = pokemonName.toLowerCase()
      let cacheEntry = pokemonResourceCache.current[lowerName]
      
      if (
        cacheEntry?.expiry === undefined || Date.now() >= cacheEntry?.expiry
      ) {
        cacheEntry = {
          resource: createPokemonResource(lowerName),
          expiry: Date.now() + cacheTime,
        }
        pokemonResourceCache.current[lowerName] = cacheEntry
      }
      return pokemonResourceCache.current[lowerName]?.resource
    },
    [cacheTime],
  )

  return (
    <CacheContext.Provider value={getPokemonResource}>
      {children}
    </CacheContext.Provider>
  )
}

function App() {
  const getPokemonResourceCacheContext = usePokemonCache()
  const [pokemonName, setPokemonName] = React.useState('')
  const [startTransition, isPending] = React.useTransition(SUSPENSE_CONFIG)
  const [pokemonResource, setPokemonResource] = React.useState(null)

  React.useEffect(() => {
    if (!pokemonName) {
      setPokemonResource(null)
      return
    }
    startTransition(() => {
      // 🐨 change this to getPokemonResource instead
      setPokemonResource(getPokemonResourceCacheContext(pokemonName))
    })
  }, [pokemonName, startTransition, getPokemonResourceCacheContext])

  function handleSubmit(newPokemonName) {
    setPokemonName(newPokemonName)
  }

  function handleReset() {
    setPokemonName('')
  }

  return (
    <div className="pokemon-info-app">
      <PokemonForm pokemonName={pokemonName} onSubmit={handleSubmit} />
      <hr />
      <div className={`pokemon-info ${isPending ? 'pokemon-loading' : ''}`}>
        {pokemonResource ? (
          <PokemonErrorBoundary
            onReset={handleReset}
            resetKeys={[pokemonResource]}
          >
            <React.Suspense
              fallback={<PokemonInfoFallback name={pokemonName} />}
            >
              <PokemonInfo pokemonResource={pokemonResource} />
            </React.Suspense>
          </PokemonErrorBoundary>
        ) : (
          'Submit a pokemon'
        )}
      </div>
    </div>
  )
}

function AppWithProvider() {
  return (
    <PokemonCacheProvider cacheTime={10000}>
      <App />
    </PokemonCacheProvider>
  )
}

export default AppWithProvider
