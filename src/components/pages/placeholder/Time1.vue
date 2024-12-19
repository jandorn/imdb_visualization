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
        Let's look at how average movie ratings have changed <b>over time</b>. <br><br><br>
        <!--The blue area shows the confidence interval of the ratings.-->
      </div>
    </div>
    <div class="charts-container">
      <GenreTimeChart1 :movies="movieStore.movies" />
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
