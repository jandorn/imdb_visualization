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
        Let's look at how movie ratings have changed <b>over time</b>. <br>
        <!--The blue area shows the confidence interval of the ratings.-->
      </div>
    </div>
    <div class="mt-8 relative">
      <GenreTimeChart1 :movies="movieStore.movies" />
    </div>
  </PageLayout>
</template> 