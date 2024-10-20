import { defineStore } from 'pinia'
import * as d3 from 'd3'

export const useMovieStore = defineStore('movie', {
  state: () => ({
    movies: [],
    isLoading: false,
    error: null
  }),
  actions: {
    async fetchMovies() {
      this.isLoading = true
      try {
        const response = await fetch('/api/AllMovies.csv')
        const tsvText = await response.text()
        const loadedData = d3.tsvParse(tsvText)
        console.log('Loaded Data:', loadedData); 
        this.movies = loadedData.map(d => ({
          tconst: d.tconst,
          titleType: d.titleType,
          primaryTitle: d.primaryTitle,
          originalTitle: d.originalTitle,
          isAdult: d.isAdult === '1',
          startYear: d.startYear !== '\\N' ? +d.startYear : null,
          endYear: d.endYear !== '\\N' ? +d.endYear : null,
          runtimeMinutes: d.runtimeMinutes !== '\\N' ? +d.runtimeMinutes : null,
          genres: d.genres,
          averageRating: +d.averageRating,
          numVotes: +d.numVotes
        }))
      } catch (error) {
        this.error = error
        console.error('Fehler beim Laden der Daten:', error)
      } finally {
        this.isLoading = false
      }
    }
  }
})
