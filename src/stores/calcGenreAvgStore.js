import { defineStore } from 'pinia'
import { useMovieStore } from './movieStore'

export const useCalcGenreAvgStore = defineStore('calcGenreAvg', {
  state: () => ({
    genreAverages: {},
    isCalculating: false
  }),

  actions: {
    async calculateGenreAverages() {
      const movieStore = useMovieStore()
      this.isCalculating = true

      try {
        console.log('Movie Store Status:', {
          isLoading: movieStore.isLoading,
          moviesCount: movieStore.movies.length
        })

        const genreSums = {}
        const genreCounts = {}

        console.log('First few movies:', movieStore.movies.slice(0, 3))

        movieStore.movies.forEach(movie => {
          movie.genres.forEach(genre => {
            if (!genreSums[genre]) {
              genreSums[genre] = 0
              genreCounts[genre] = 0
            }
            genreSums[genre] += movie.averageRating
            genreCounts[genre]++
          })
        })

        console.log('Genre Sums:', genreSums)
        console.log('Genre Counts:', genreCounts)

        this.genreAverages = Object.keys(genreSums).reduce((acc, genre) => {
          acc[genre] = genreSums[genre] / genreCounts[genre]
          return acc
        }, {})

        console.log('Final Genre Averages:', this.genreAverages)

      } catch (error) {
        console.error('Fehler bei der Genre-Durchschnittsberechnung:', error)
      } finally {
        this.isCalculating = false
      }
    }
  }
}) 