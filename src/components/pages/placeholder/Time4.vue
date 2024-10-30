<script setup>
import { useMovieStore } from '../../../stores/movieStore.js';
import GenreTimeChart1 from '../../charts/GenreTimeChart1.vue';
import PageLayout from '../../layout/PageLayout.vue';

const movieStore = useMovieStore();
</script>

<template>
  <PageLayout>
    <div class="w-full justify-start text-lg">
      <div>
        The <b>yellow parts</b> of the line indicate years where we have very limited data - either only one movie or no movies at all in our database.
      </div>
    </div>
    <div class="mt-8 relative">
      <GenreTimeChart1 
        :movies="movieStore.movies" 
        :showConfidence="true"
        :showAnnotation="true"
        :showLimitedData="true"
      />
    </div>
  </PageLayout>
</template> 