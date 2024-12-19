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
    <div class="mt-8 relative flex flex-wrap">
      <div class="line-chart-container">
        <GenreTimeChart3 
          :movies="movieStore.movies" 
          :selectedGenres="[]" 
          :arrowYear="2021"
          :showConfidence="true"
          :showAnnotation="true"
          :animateAnnotation="false"
          :animateAnnotation2="true"      
        />
      </div>
      <div class="histograms-container">
        <YearlyHistograms :movies="movieStore.movies" class="ml-4" />
      </div>
    </div>
  </PageLayout>
</template>

<style scoped>
.charts-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between; 
  gap: 16px; 
}

.line-chart-container {
  flex: 0 0 700px; 
  min-width: 700px;
}

.histograms-container {
  flex: 1; 
  min-width: 400px;
}

@media (max-width: 1000px) {
  .charts-container {
    flex-direction: column; 
    gap: 16px; 
  }

  .line-chart-container {
    flex: 0 0 auto; 
    margin-bottom: 0;
  }

  .histograms-container {
    flex: 1 1 auto; 
    margin-top: 0;
  }
}

@media (max-width: 500px) {
  .line-chart-container {
    width: 100%;
    min-width: auto; 
  }

  .histograms-container {
    width: 100%; 
    min-width: auto;
  }
}
</style>


