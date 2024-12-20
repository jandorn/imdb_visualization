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

let svg, g;
const isZoomedIn = ref(false); 

onMounted(() => {
  svg = d3.select("#spiral");
  g = svg.append("g"); 

  const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("visibility", "hidden")
    .style("background-color", "white")
    .style("border", "1px solid #ccc")
    .style("padding", "8px")
    .style("border-radius", "4px")
    .style("box-shadow", "0 2px 8px rgba(0, 0, 0, 0.2)")
    .style("pointer-events", "none");

  spiralData.forEach(point => {
    g.append("circle")
      .attr("cx", point.x)
      .attr("cy", point.y)
      .attr("r", Math.sqrt(point.runtime) * 0.08)
      .attr("fill", point.color)
      .on("mouseover", (event) => {
        tooltip.style("visibility", "visible")
          .html(`
            <strong>${point.title}</strong><br>
            Year: ${point.year}<br>
            Runtime: ${point.runtime} mins<br>
            Average Rating: ${point.rating}
          `);
      })
      .on("mousemove", (event) => {
        tooltip.style("top", (event.pageY + 10) + "px")
          .style("left", (event.pageX + 10) + "px");
      })
      .on("mouseleave", () => {
        tooltip.style("visibility", "hidden");
      });
  });
});

const toggleZoom = (event) => {
  event.preventDefault();
  event.stopPropagation(); 

  console.log("Zoom button clicked"); 

  const zoomTarget = { x: -300, y: -100 }; 
  const scale = isZoomedIn.value ? 1 : 4; 

  g.transition()
    .duration(750) 
    .attr("transform", `translate(${isZoomedIn.value ? 0 : zoomTarget.x}, ${isZoomedIn.value ? 0 : zoomTarget.y}) scale(${scale})`);

  isZoomedIn.value = !isZoomedIn.value;
};
</script>

<template>
  <PageLayout>
    <div class="w-full justify-start text-lg">
      <div class="w-full justify-start text-lg">
      Have you also heard that <b>movies got longer in the recent past</b>? Let's visualize them in a spiral of equidistant points, where the movies are placed on a spiral ordered by start year, beginning from the center. The dot size and brightness reflects the runtime.<br>
      <b>Zoom in</b> to dive into the first half of the 20th century. Looks like movie lengths varied more in these years, right?<br>
      
      </div>
    </div>

    <div class="mt-4 flex">
      <button 
        type="button" 
        @click="toggleZoom" 
        class="bg-blue-500 text-white px-4 py-2 rounded">
        {{ isZoomedIn ? 'Zoom Out' : 'Zoom In' }}
      </button>
    </div>

    <div class="mt-8 flex flex-col items-center">
      <svg id="spiral" width="800" height="800" viewBox="-450 -450 900 900">
        <g></g>
      </svg>
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

