import { defineStore } from 'pinia'
import { useMovieStore } from './movieStore'

export const useTop100MoviesStore = defineStore('top100movies', {
  state: () => ({
    top100: {},
    isCalculating: false,
  }),

  actions: {
    calculateTop100() {
      const movieStore = useMovieStore()
      this.isCalculating = true

      try {
        const sortedMovies = [...movieStore.movies]
          .filter(movie => 
            movie.titleType === 'movie' && 
            movie.numVotes >= 100000
          )
          .sort((a, b) => b.averageRating - a.averageRating)
          .slice(0, 100)

        this.top100 = sortedMovies.reduce((acc, movie, index) => {
          acc[index + 1] = {
            title: movie.primaryTitle,
            averageRating: movie.averageRating,
            numVotes: movie.numVotes,
            startYear: movie.startYear
          }
          return acc
        }, {})

      } catch (error) {
        console.error('Fehler beim Berechnen der Top 100:', error)
      } finally {
        this.isCalculating = false
      }
    }
  }
}) 