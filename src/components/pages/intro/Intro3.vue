<script setup>
import { useMovieStore } from '../../../stores/movieStore.js';
import PageLayout from '../../layout/PageLayout.vue';
import GenreTimeChart1 from '../../charts/GenreTimeChart1.vue';

const movieStore = useMovieStore();
</script>

<template>
  <PageLayout>
    <div v-if="movieStore.isLoading">Daten werden geladen...</div>
    <div v-else-if="movieStore.error">Fehler beim Laden der Daten: {{ movieStore.error }}</div>
    <div v-else-if="movieStore.movies.length === 0">Keine Daten verfügbar.</div>
    <div v-else>
      <div class="mb-8">
        <h2 class="text-2xl font-bold mb-2">Average ratings over time</h2>
        <p class="text-gray-600">
          Let's see if average ratings have changed over time.
        </p>
      </div>
      <GenreTimeChart1 :movies="movieStore.movies" />
    </div>
  </PageLayout>
</template>


