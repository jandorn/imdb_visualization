<script setup>
import { useMovieStore } from '../../../stores/movieStore.js';
import GenreTimeChart2 from '../../charts/GenreTimeChart2.vue';
import YearlyHistograms from '../../charts/YearlyHistograms_alternative.vue';
import PageLayout from '../../layout/PageLayout.vue';

const movieStore = useMovieStore();
</script>

<template>
  <PageLayout>
    <div class="w-full justify-start text-lg">
      <div>
        The confidence intervals of the average ratings are more reliable after 1950, because the data are normally distributed.<br>
        They are small, because we have more data and hence <b>strongly clustering around the true mean</b>.<br>
      </div>
    </div>
    <div class="mt-8 relative flex">
      <GenreTimeChart2
      :movies="movieStore.movies" 
      />
      <YearlyHistograms :movies="movieStore.movies" class="ml-4" />
    </div>
  </PageLayout>
</template>  