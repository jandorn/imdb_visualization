<script setup>
import { useMovieStore } from '../../../stores/movieStore.js';
import GenreTimeChart1 from '../../charts/GenreTimeChart1.vue';
import YearlyHistograms from '../../charts/YearlyHistograms_alternative.vue';
import PageLayout from '../../layout/PageLayout.vue';

const movieStore = useMovieStore();
</script>

<template>
  <PageLayout>
    <div class="w-full justify-start text-lg">
      <div>
        Notice the large uncertainty around <b>1906</b> due to the limited number of movies and ratings from that period.<br>
        Now, the y-axes of the histograms are scaled to the same maximum value for better comparison. Apparently, there are very few data points for the early years.
      </div>
    </div>
    <div class="mt-8 relative flex">
      <GenreTimeChart1 
        :movies="movieStore.movies" 
        :showConfidence="true"
        :showAnnotation="true"
        :animateAnnotation="true"
        :animateAnnotation2="false"
      />
      <YearlyHistograms :movies="movieStore.movies" class="ml-4" />
    </div>
  </PageLayout>
</template> 