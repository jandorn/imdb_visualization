import { defineStore } from 'pinia'
import * as d3 from 'd3'
import { useCalcGenreAvgStore } from './calcGenreAvgStore'

export const useMovieStore = defineStore('movie', {
  state: () => ({
    movies: [],
    isLoading: false,
    error: null,
    loadingProgress: 0
  }),
  actions: {
    async fetchMovies() {
      this.isLoading = true
      this.loadingProgress = 0
      try {
        const response = await fetch('/api/AllMovies.csv')
        const reader = response.body.getReader()
        const contentLength = +response.headers.get('Content-Length')

        let receivedLength = 0
        let chunks = []
        while(true) {
          const {done, value} = await reader.read()
          
          if (done) {
            break
          }
          
          chunks.push(value)
          receivedLength += value.length
          this.loadingProgress = Math.round((receivedLength / contentLength) * 100)
        }

        let tsvText = new TextDecoder("utf-8").decode(new Uint8Array(chunks.flatMap(chunk => Array.from(chunk))))
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
          genres: d.genres !== '\\N' ? d.genres.split(',') : [],
          averageRating: +d.averageRating,
          numVotes: +d.numVotes
        }))

        // trigger calculations after loading
        const genreAvgStore = useCalcGenreAvgStore()
        await genreAvgStore.calculateGenreAverages()
      } catch (error) {
        this.error = error
        console.error('Fehler beim Laden der Daten:', error)
      } finally {
        this.isLoading = false
        this.loadingProgress = 100
      }
    }
  }
})
