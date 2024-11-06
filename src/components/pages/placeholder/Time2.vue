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
        The blue area shows the 95% confidence interval - how <b>certain</b> we are about the average rating.<br><br>
      </div>
    </div>
    <div class="mt-8 relative">
      <GenreTimeChart1  :movies="movieStore.movies" 
                        :showConfidence="true" />
    </div>
  </PageLayout>
</template> 