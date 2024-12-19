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
        For some years, the confidence interval is <b>undefined</b>, because there is only one movie from that year, or no movie at all. <br><br>
      </div>
    </div>
    <div class="mt-8 relative flex flex-wrap">
      <div class="charts-container">
        <div class="line-chart-container">
          <GenreTimeChart1 
            :movies="movieStore.movies" 
            :showConfidence="true"
            :showAnnotation="true"
            :animateAnnotation="false"
            :animateAnnotation2="true"      
          />
        </div>
        <div class="histograms-container">
          <YearlyHistograms :movies="movieStore.movies" />
        </div>
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
