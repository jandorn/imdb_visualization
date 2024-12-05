<script setup>
import { ref, watch, onMounted } from 'vue';
import * as d3 from 'd3';

const props = defineProps({
  movies: {
    type: Array,
    required: true
  }
});

const histogramsRef = ref(null);

const processData = () => {
  const yearData = {};
  props.movies.forEach((movie) => {
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

  const tooltip = d3.select(histogramsRef.value)
    .append("div")
    .style("position", "absolute")
    .style("visibility", "hidden")
    .style("background", "lightgrey")
    .style("padding", "5px")
    .style("border-radius", "5px");

  svg.each(function([year, ratings]) {
    const x = d3.scaleLinear()
      .domain([1, 10])
      .range([0, width]);

    const histogram = d3.histogram()
      .domain(x.domain())
      .thresholds(x.ticks(10));

    const bins = histogram(ratings);

    const y = d3.scaleLinear()
      .domain([0, d3.max(bins, d => d.length)])
      .range([height, 0]);

      const tooltip = d3.select("body") 
  .append("div")
  .style("position", "absolute")
  .style("visibility", "hidden")
  .style("background-color", "white")
  .style("padding", "5px")
  .style("border-radius", "4px")
  .style("font-size", "12px");

  d3.select(this).append("g")
    .selectAll("rect")
    .data(bins)
    .enter()
    .append("rect")
    .attr("x", d => x(d.x0))
    .attr("y", d => y(d.length))
    .attr("width", x(bins[0].x1) - x(bins[0].x0) - 1)
    .attr("height", d => height - y(d.length))
    .attr("fill", "steelblue")
    .on("mouseover", function(event, d) {
      d3.select(this).attr("fill", "#F5C519");
      tooltip.html(`Movie count: ${d.length}`)
        .style("visibility", "visible")
        .style("top", `${event.pageY}px`) 
        .style("left", `${event.pageX + 10}px`); 
    })
    .on("mousemove", function(event) {
      tooltip
        .style("top", `${event.pageY}px`) 
        .style("left", `${event.pageX + 10}px`); 
    })
    .on("mouseout", function() {
      d3.select(this).attr("fill", "steelblue");
      tooltip.style("visibility", "hidden");
    });

    d3.select(this).append("text")
      .attr("x", width / 2)
      .attr("y", height + margin.bottom)
      .attr("text-anchor", "middle")
      .attr("font-size", "8px")
      .text(year);
  });
};

watch(() => props.movies, (newMovies) => {
  if (newMovies.length > 0) {
    const yearData = processData();
    renderHistograms(yearData);
  }
}, { immediate: true });

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
