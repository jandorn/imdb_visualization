<script setup>
import { ref, watch, onMounted, computed } from 'vue';
import * as d3 from 'd3';

const props = defineProps({
  movies: {
    type: Array,
    required: true
  },
  selectedGenres: {
    type: Array,
    required: true
  }
});

const histogramsRef = ref(null);

const filteredMovies = computed(() => {
  if (props.selectedGenres.length === 0) {
    return props.movies;
  }
  return props.movies.filter(movie => {
    if (!movie.genres) return false;
    const movieGenres = Array.isArray(movie.genres)
      ? movie.genres
      : movie.genres.toString().split(',').map(g => g.trim());
    
    return props.selectedGenres.some(genre => movieGenres.includes(genre));
  });
});

const processData = () => {
  const yearData = {};
  filteredMovies.value.forEach((movie) => {
    if (movie && movie.startYear && movie.averageRating) {
      const year = parseInt(movie.startYear);
      if (!isNaN(year)) {
        if (!yearData[year]) {
          yearData[year] = [];
        }
        const rating = parseFloat(movie.averageRating);
        if (!isNaN(rating)) {
          yearData[year].push(rating);
        }
      }
    }
  });
  return yearData;
};

const renderHistograms = (yearData) => {
  const margin = { top: 10, right: 10, bottom: 10, left: 10 };
  const width = 50 - margin.left - margin.right; 
  const height = 50 - margin.top - margin.bottom; 

  const allRatings = Object.values(yearData).flat();
  const x = d3.scaleLinear()
    .domain([1, 10])
    .range([0, width]);

  const histogram = d3.histogram()
    .domain(x.domain())
    .thresholds(x.ticks(10));

  const allBins = Object.values(yearData).map(ratings => histogram(ratings));
  const maxBinCount = d3.max(allBins.flat(), d => d.length);

  const y = d3.scaleLinear()
    .domain([0, maxBinCount])
    .range([height, 0]);

  // Clear existing histograms
  d3.select(histogramsRef.value).selectAll("*").remove();

  const svg = d3.select(histogramsRef.value)
    .selectAll("svg")
    .data(Object.entries(yearData))
    .enter()
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  svg.each(function([year, ratings]) {
    const bins = histogram(ratings);

    d3.select(this).append("g")
      .selectAll("rect")
      .data(bins)
      .enter()
      .append("rect")
      .attr("x", d => x(d.x0))
      .attr("y", d => y(d.length))
      .attr("width", x(bins[0].x1) - x(bins[0].x0) - 1)
      .attr("height", d => height - y(d.length))
      .attr("fill", "steelblue");

    d3.select(this).append("text")
      .attr("x", width / 2)
      .attr("y", height + margin.bottom)
      .attr("text-anchor", "middle")
      .attr("font-size", "8px")
      .text(year);
  });
};

watch(filteredMovies, (newMovies) => {
  const yearData = processData();
  renderHistograms(yearData);
}, { immediate: true });

watch(() => props.selectedGenres, () => {
  const yearData = processData();
  renderHistograms(yearData);
}, { deep: true });

onMounted(() => {
  const yearData = processData();
  renderHistograms(yearData);
});
</script>

<template>
  <div ref="histogramsRef" class="flex flex-wrap"></div>
</template>

<style scoped>
.histogram {
  margin: 2px;
}
</style>