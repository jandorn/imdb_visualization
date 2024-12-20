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
      Even though we have to keep in mind that there are very few movies in early years, let's have a look at the <b>evolution and variability of runtimes</b> over the years.<br>
      As we can take from the box plots, movies indeed have been <b>getting a bit longer</b>. But the <b>variability of movie runtimes has decreased</b>, compared to the first quarter of the 20th century.<br><br><br>
    </div>

    <div class="w-full justify-start">
      <Boxplot :movieData="movies" /> 
    </div>
  </PageLayout>
</template>


