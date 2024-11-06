<script setup>
import { useMovieStore } from '../../../stores/movieStore.js';
import GenreTimeChart3 from '../../charts/GenreTimeChart3.vue';
import GenreHistogram from '../../charts/GenreHistogram.vue';
import PageLayout from '../../layout/PageLayout.vue';
import { ref } from 'vue';

const movieStore = useMovieStore();
const selectedGenres = ref([]);
</script>

<template>
  <PageLayout>
    <div class="w-full justify-start text-lg">
      <div>
        Select genres to display their average ratings over time.
      </div>
    </div>
    <div class="genre-selection-panel">
      <select v-model="selectedGenres" multiple>
        <option v-for="genre in genres" :key="genre" :value="genre">{{ genre }}</option>
      </select>
    </div>
    <div class="mt-8 relative flex">
        <GenreTimeChart3 :movies="movieStore.movies" :selectedGenres="selectedGenres" />
        <GenreHistogram :movies="movieStore.movies" :selectedGenres="selectedGenres" class="ml-4"/>
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

