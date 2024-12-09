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
    <div class="mt-8 relative flex flex-wrap">
      <div class="line-chart-container">
        <GenreTimeChart2
          :movies="movieStore.movies" 
        />
      </div>
      <div class="histograms-container">
        <YearlyHistograms :movies="movieStore.movies" />
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