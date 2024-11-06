<script setup>
import { useMovieStore } from '../../../stores/movieStore.js';
import GenreTimeChart1 from '../../charts/GenreTimeChart1.vue';
import YearlyHistograms from '../../charts/YearlyHistograms.vue';
import PageLayout from '../../layout/PageLayout.vue';

const movieStore = useMovieStore();
</script>

<template>
  <PageLayout>
    <div class="w-full justify-start text-lg">
      <div>
        For the confidence interval to be meaningful, we need to make sure that the data per year are <b>normally distributed</b>. <br>
        Let's have a look at the histograms of average ratings. The y-axes of the histograms are scaled to their respective maximum value for better visibility.
      </div>
    </div>
    <div class="mt-8 relative flex">
      <GenreTimeChart1  :movies="movieStore.movies" 
                        :showConfidence="true"
                        :animateConfidence="false" />
      <YearlyHistograms :movies="movieStore.movies" class="ml-4" />
    </div>
  </PageLayout>
</template>