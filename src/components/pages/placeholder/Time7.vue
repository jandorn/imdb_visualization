<script setup>
import { useMovieStore } from '../../../stores/movieStore.js';
import GenreTimeChart3 from '../../charts/GenreTimeChart3.vue';
import GenreHistogram from '../../charts/GenreHistogram.vue';
import PageLayout from '../../layout/PageLayout.vue';
import { ref } from 'vue';

const movieStore = useMovieStore();
const selectedGenre = ref('');

const genres = ['Action', 'Comedy', 'Drama', 'Horror', 'Romance', 'Sci-Fi', 'Thriller', 'Documentary'];
</script>

<template>
  <PageLayout>
    <div class="w-full justify-start text-lg">
      <div>
        Select a genre to display its average ratings over time, and its distribution of ratings.
      </div>
    </div>
    <div class="genre-selection-panel" style="margin-top: 4px;">
      <select v-model="selectedGenre" @click.stop>
        <option value="">All Genres</option>
        <option v-for="genre in genres" :key="genre" :value="genre">{{ genre }}</option>
      </select>
    </div>
    <div class="mt-8 relative flex flex-wrap">
      <div class="charts-container">
        <div class="line-chart-container">
          <GenreTimeChart3 
            :movies="movieStore.movies" 
            :selectedGenres="selectedGenre ? [selectedGenre] : []" 
          />
        </div>
        <div class="histograms-container">
          <GenreHistogram 
            :movies="movieStore.movies" 
            :selectedGenres="selectedGenre ? [selectedGenre] : []"
          />
        </div>
      </div>
    </div>
  </PageLayout>
</template>

<style scoped>
.charts-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between; 
  gap: 16px; 
}

.line-chart-container {
  flex: 0 0 700px; 
  min-width: 700px;
}

.histograms-container {
  flex: 1; 
  min-width: 400px;
}

@media (max-width: 1000px) {
  .charts-container {
    flex-direction: column; 
    gap: 16px; 
  }

  .line-chart-container {
    flex: 0 0 auto; 
    margin-bottom: 0;
  }

  .histograms-container {
    flex: 1 1 auto; 
    margin-top: 0;
  }
}

@media (max-width: 500px) {
  .line-chart-container {
    width: 100%;
    min-width: auto; 
  }

  .histograms-container {
    width: 100%; 
    min-width: auto;
  }
}
</style>

