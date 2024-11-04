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
        For some years, the confidence interval is <b>undefined</b>, because there is only one movie from that year. <br>
      </div>
    </div>
    <div class="mt-8 relative">
      <GenreTimeChart1 
        :movies="movieStore.movies" 
        :showConfidence="true"
        :showAnnotation="true"
        :animateAnnotation="false"
        :animateAnnotation2="true"      />
    </div>
  </PageLayout>
</template> 