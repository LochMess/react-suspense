// Simple Data-fetching
// http://localhost:3000/isolated/exercise/01.js

import * as React from 'react'
// 🐨 you'll also need to get the fetchPokemon function from ../pokemon:
import {PokemonDataView, fetchPokemon, PokemonErrorBoundary} from '../pokemon'

// 💰 use it like this: fetchPokemon(pokemonName).then(handleSuccess, handleFailure)

// 🐨 create a variable called "pokemon" (using let)
const createResource = promise => {
  let status = 'pending'
  let data
  let error
  let dataPromise = promise.then(
    res => {
      status = 'success'
      data = res
    },
    err => {
      status = 'error'
      error = err
    },
  )

  return {
    read() {
      switch (status) {
        case 'pending':
          throw dataPromise
        case 'error':
          throw error
        case 'success':
          return data
        default:
          throw new Error('createResource status value is invalid')
      }
    },
  }
}

let resource = createResource(fetchPokemon('bulbasaur'))

// We don't need the app to be mounted to know that we want to fetch the pokemon
// named "pikachu" so we can go ahead and do that right here.
// 🐨 assign a pokemonPromise variable to a call to fetchPokemon('pikachu')

// 🐨 when the promise resolves, assign the "pokemon" variable to the resolved value
// 💰 For example: somePromise.then(resolvedValue => (someValue = resolvedValue))

function PokemonInfo() {
  // 🐨 if there's no pokemon yet, then throw the pokemonPromise
  // 💰 (no, for real. Like: `throw pokemonPromise`)
  const pokemon = resource.read()
  // if the code gets it this far, then the pokemon variable is defined and
  // rendering can continue!
  return (
    <div>
      <div className="pokemon-info__img-wrapper">
        <img src={pokemon.image} alt={pokemon.name} />
      </div>
      <PokemonDataView pokemon={pokemon} />
    </div>
  )
}

function App() {
  return (
    <div className="pokemon-info-app">
      <div className="pokemon-info">
        <PokemonErrorBoundary>
          <React.Suspense fallback={<p>Loading... Please wait</p>}>
            {/* 🐨 Wrap the PokemonInfo component with a React.Suspense component with a fallback */}
            <PokemonInfo />
          </React.Suspense>
        </PokemonErrorBoundary>
      </div>
    </div>
  )
}

export default App
