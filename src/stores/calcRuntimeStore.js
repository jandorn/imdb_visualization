import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useMovieStore } from './movieStore'; 

export const useCalcRuntimeStore = defineStore('calcRuntime', {
  state: () => ({
    yearlyData: ref({}),
    isCalculating: ref(false),
  }),

  actions: {
    async calculateYearlyAverages() {
      const movieStore = useMovieStore();
      this.isCalculating = true;

      try {
        const yearData = {};

        movieStore.movies.forEach(movie => {
          const year = movie.startYear; 
          const runtime = movie.runtimeMinutes; 

          if (!yearData[year]) {
            yearData[year] = {
              runtimes: [],
              average: 0,
              min: 0,
              max: 0,
            };
          }

          yearData[year].runtimes.push(runtime);
          yearData[year].min = Math.min(yearData[year].min, runtime);
          yearData[year].max = Math.max(yearData[year].max, runtime);
        });

        Object.keys(yearData).forEach(year => {
          const runtimes = yearData[year].runtimes;
          const total = runtimes.reduce((acc, curr) => acc + curr, 0);
          yearData[year].average = total / runtimes.length;
        });

        this.yearlyData = yearData;

      } catch (error) {
        console.error('Error calculating yearly averages:', error);
      } finally {
        this.isCalculating = false;
      }
    },
  },

  getters: {
    getYearlyData: (state) => {
      return state.yearlyData;
    },
  },
}); 