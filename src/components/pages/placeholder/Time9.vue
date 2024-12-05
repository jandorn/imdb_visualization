<script setup>
import { useMovieStore } from '../../../stores/movieStore.js';
import GenreTimeChart3 from '../../charts/GenreTimeChart3.vue';
import YearlyHistograms from '../../charts/YearlyHistograms_alternative.vue';
import PageLayout from '../../layout/PageLayout.vue';

const movieStore = useMovieStore();
</script>

<template>
  <PageLayout>
    <div class="w-full justify-start text-lg">
      <div>
        The ratings <b>might be biased</b>: Possibly, newly released movies first draw more attention of an audience group that is more likely to give the movie higher ratings<br>
        (because they are certain that they will like it as they have liked similar movies before).<br>
      </div>
    </div>
    <div class="mt-8 relative flex">
      <GenreTimeChart3 
        :movies="movieStore.movies" 
        :selectedGenres="[]" 
        :arrowYear="2021"
        :showConfidence="true"
        :showAnnotation="true"
        :animateAnnotation="false"
        :animateAnnotation2="true"      
      />
      <YearlyHistograms :movies="movieStore.movies" class="ml-4" />
    </div>
  </PageLayout>
</template>


