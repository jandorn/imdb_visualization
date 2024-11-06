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
        Let's have a look at movies from <b>1950 or later</b>, for which we have at least 1000 movies per year and, looking at the histograms, are close to a normal distribution. <br><br>
      </div>
    </div>
    <div class="mt-8 relative flex">
      <GenreTimeChart1 
        :movies="movieStore.movies" 
        :showConfidence="true"
        :showAnnotation="false"
        :animateAnnotation="false"
        :animateAnnotation2="false"
        :scaleXAxis="true"
      />
      <YearlyHistograms :movies="movieStore.movies" class="ml-4" />
    </div>
  </PageLayout>
</template> 