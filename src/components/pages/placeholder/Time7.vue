<script setup>
import { useMovieStore } from '../../../stores/movieStore.js';
import GenreTimeChart3 from '../../charts/GenreTimeChart3.vue';
import GenreHistogram from '../../charts/GenreHistogram.vue';
import PageLayout from '../../layout/PageLayout.vue';
import { ref } from 'vue';

const movieStore = useMovieStore();
const selectedGenre = ref('');

const genres = ['Action', 'Comedy', 'Drama', 'Horror', 'Romance', 'Sci-Fi', 'Thriller', 'Documentary', 'Reality-TV', 'Game-Show', 'Talk-Show'];
</script>

<template>
  <PageLayout>
    <div class="w-full justify-start text-lg">
      <div>
        Select a genre to display its average ratings over time, and its distribution of ratings.
      </div>
    </div>
    <div class="genre-selection-panel">
      <select v-model="selectedGenre">
        <option value="">All Genres</option>
        <option v-for="genre in genres" :key="genre" :value="genre">{{ genre }}</option>
      </select>
    </div>
    <div class="mt-8 relative flex">
        <div class="w-3/4">
          <GenreTimeChart3 
            :movies="movieStore.movies" 
            :selectedGenres="selectedGenre ? [selectedGenre] : []" 
          />
        </div>
        <div class="ml-4">
          <GenreHistogram 
            :movies="movieStore.movies" 
            :selectedGenres="selectedGenre ? [selectedGenre] : []"
          />
        </div>
    </div>
  </PageLayout>
</template>

<script>
export default {
  data() {
    return {
      genres: ['Action', 'Comedy', 'Drama', 'Horror', 'Romance', 'Sci-Fi', 'Thriller']
    };
  }
};
</script>

