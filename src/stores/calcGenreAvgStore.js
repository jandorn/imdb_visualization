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
        const genreData = {}

        movieStore.movies.forEach(movie => {
          movie.genres.forEach(genre => {
            if (!genreData[genre]) {
              genreData[genre] = {
                sum: 0,
                amount: 0,
                data: []
              }
            }
            genreData[genre].sum += movie.averageRating
            genreData[genre].amount++
            genreData[genre].data.push(movie.averageRating)
          })
        })

        this.genreAverages = Object.keys(genreData).reduce((acc, genre) => {
          acc[genre] = {
            average: genreData[genre].sum / genreData[genre].amount,
            amount: genreData[genre].amount,
            data: genreData[genre].data
          }
          return acc
        }, {})

        console.log('Final Genre Data:', this.genreAverages)

      } catch (error) {
        console.error('Fehler bei der Genre-Durchschnittsberechnung:', error)
      } finally {
        this.isCalculating = false
      }
    }
  }
}) 