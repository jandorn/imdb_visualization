<script setup>
import { ref } from 'vue';
import PageLayout from '../../layout/PageLayout.vue';
import Boxplot from '../../../components/charts/Boxplot.vue'; 
import { useMovieStore } from '../../../stores/movieStore.js'; 

const movieStore = useMovieStore(); 

const movies = movieStore.movies
  .filter(movie => movie.titleType === 'movie')
  .sort((a, b) => a.startYear - b.startYear); 

</script>

<template>
  <PageLayout>
    <div class="w-full justify-start text-lg">
      Here is the boxplot visualization of movie runtimes over the years.
    </div>

    <div class="mt-8">
      <h2>Boxplot of Movie Runtimes Over the Years</h2>
      <Boxplot :movieData="movies" /> 
    </div>
  </PageLayout>
</template>


