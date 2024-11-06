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
        For some years, the confidence interval is <b>undefined</b>, because there is only one movie from that year, or no movie at all. <br><br>
      </div>
    </div>
    <div class="mt-8 relative flex">
      <GenreTimeChart1 
        :movies="movieStore.movies" 
        :showConfidence="true"
        :showAnnotation="true"
        :animateAnnotation="false"
        :animateAnnotation2="true"      
        />
        <YearlyHistograms :movies="movieStore.movies" class="ml-4" />
    </div>
  </PageLayout>
</template> 