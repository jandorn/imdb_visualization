<script setup>
import { ref, onMounted } from 'vue';
import PageLayout from '../../layout/PageLayout.vue';
import { useMovieStore } from '../../../stores/movieStore.js'; 
import * as d3 from 'd3';

const movieStore = useMovieStore(); 

const movies = movieStore.movies
  .filter(movie => movie.titleType === 'movie')
  .sort((a, b) => a.startYear - b.startYear); 

const getColorByRuntime = (runtime) => {
  const minRuntime = 0;
  const maxRuntime = 120;
  const scaledValue = Math.min(Math.max(runtime, minRuntime), maxRuntime);
  const blueIntensity = Math.floor((scaledValue / maxRuntime) * 255);
  return `rgb(0, 0, ${blueIntensity})`; 
};

const distanceIncrement = 0.85; 
const spiralData = movies.map((movie, index) => {
  const angle = index * 0.2; 
  const radius = distanceIncrement * Math.sqrt(index);
  return {
    x: radius * Math.cos(angle),
    y: radius * Math.sin(angle),
    runtime: parseInt(movie.runtimeMinutes) || 0,
    title: movie.primaryTitle,
    year: movie.startYear,
    rating: movie.averageRating,
    color: getColorByRuntime(parseInt(movie.runtimeMinutes) || 0)
  };
});

const tooltip = ref({
  visible: false,
  title: '',
  year: '',
  runtime: '',
  x: 0,
  y: 0
});

const showTooltip = (event, point) => {
  tooltip.value = {
    visible: true,
    title: point.title,
    year: point.year,
    runtime: point.runtime,
    rating: point.rating,
    x: event.clientX, 
    y: event.clientY   
  };
};

const hideTooltip = () => {
  tooltip.value.visible = false;
};

const randomMovie = movies.length > 0 ? movies[Math.floor(Math.random() * movies.length)] : null; // Select a random movie

let svg, g;
const isZoomedIn = ref(false); 

onMounted(() => {
  svg = d3.select("#spiral");
  g = svg.append("g"); 

  spiralData.forEach(point => {
    g.append("circle")
      .attr("cx", point.x)
      .attr("cy", point.y)
      .attr("r", Math.sqrt(point.runtime) * 0.08)
      .attr("fill", point.color)
      .on("mouseover", (event) => showTooltip(event, point))
      .on("mouseleave", hideTooltip);
  });
});

const toggleZoom = () => {
  const zoomTarget = { x: -100, y: -100 }; 
  const scale = isZoomedIn.value ? 1 : 3; 

  g.transition()
    .duration(750) 
    .attr("transform", `translate(${isZoomedIn.value ? 0 : zoomTarget.x}, ${isZoomedIn.value ? 0 : zoomTarget.y}) scale(${scale})`);

  isZoomedIn.value = !isZoomedIn.value;
};
</script>

<template>
  <PageLayout>
    <div class="w-full justify-start text-lg">
      The end of this journey is near, so it's time to pick a title and start watching! 
    </div>

    <div class="mt-8 relative overflow-visible">
      <h2>Your randomly picked title:</h2>
      <div v-if="randomMovie">
        <b>"{{ randomMovie.primaryTitle }}"</b> from {{ randomMovie.startYear }}. You need <b>{{ randomMovie.runtimeMinutes }} minutes</b> to watch this {{ randomMovie.titleType }}. It has an <b>average rating of {{ randomMovie.averageRating }}</b>. Have fun!
      </div>
      <div v-else>
        <b>No movies available to display.</b>
      </div>
    </div>

  </PageLayout>
</template>

<style>
#spiral {
  background-color: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 50%;
}

.tooltip {
  position: absolute;
  background-color: white;
  border: 1px solid #ccc;
  padding: 8px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  pointer-events: none; 
}
</style> 


