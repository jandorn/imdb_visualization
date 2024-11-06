<script setup>
import { onMounted, ref, onUnmounted, watch, nextTick } from 'vue';
import * as d3 from 'd3';

const props = defineProps({
  movies: {
    type: Array,
    required: true
  }
});

const chartRef = ref(null);
const chartWidth = ref(0);
const chartHeight = ref(600);
let processedData = ref([]);

const processData = () => {
  if (!props.movies || props.movies.length === 0) {
    processedData.value = [];
    return;
  }

  const yearData = {};
  props.movies.forEach((movie) => {
    if (movie && movie.startYear && movie.averageRating) {
      const year = parseInt(movie.startYear);
      if (!isNaN(year)) {
        if (!yearData[year]) {
          yearData[year] = { ratings: [], sum: 0, count: 0 };
        }
        const rating = parseFloat(movie.averageRating);
        if (!isNaN(rating)) {
          yearData[year].ratings.push(rating);
          yearData[year].sum += rating;
          yearData[year].count++;
        } else{
          console.log(movie.averageRating);
        }
      } else{
        console.log(movie.startYear);
      }
    }
  });

  processedData.value = Object.entries(yearData).map(([year, data]) => ({
    year: parseInt(year),
    average: data.sum / data.count,
    confidence: 1.96 * (d3.deviation(data.ratings) / Math.sqrt(data.count))
  })).sort((a, b) => a.year - b.year);

};

watch(() => props.movies, (newMovies) => {
  if (newMovies && newMovies.length > 0) {
    processData();
    nextTick(() => {
      updateChartSize();
      renderChart();
    });
  }
}, { immediate: true });

onMounted(() => {
  updateChartSize();
  renderChart();
  
  window.addEventListener('resize', handleResize);
});

const handleResize = () => {
  updateChartSize();
  renderChart();
};

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});

function updateChartSize() {
  if (chartRef.value) {
    chartWidth.value = chartRef.value.clientWidth || 600;
    chartHeight.value = chartRef.value.clientHeight || 600;
  }
}

function renderChart() {
  if (!chartRef.value || processedData.value.length === 0) return;

  const margin = { top: 20, right: 30, bottom: 40, left: 40 };
  const width = Math.min(chartRef.value.clientWidth - margin.left - margin.right, 600);
  const height = 400 - margin.top - margin.bottom;

  d3.select(chartRef.value).selectAll("*").remove();

  const svg = d3.select(chartRef.value)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleLinear()
    .domain([1950, d3.max(processedData.value, d => d.year)]) 
    .range([0, width]);

  const y = d3.scaleLinear()
    .domain([1, 10])
    .range([height, 0]);

  const xAxis = svg.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${height-1})`);

  const xAxisGroup = xAxis.call(d3.axisBottom(x).tickFormat(d3.format("d")));

  xAxisGroup.call(g => g.select('.domain').attr('stroke-width', 2))
  xAxisGroup.call(g => g.selectAll('.tick line').attr('stroke-width', 2))
  xAxisGroup.call(g => g.selectAll('text').attr('font-weight', '600'));

  const yAxis = svg.append("g")
    .call(d3.axisLeft(y).tickPadding(10));

  yAxis.call(g => g.select('.domain').attr('stroke-width', 2))
  yAxis.call(g => g.selectAll('.tick line').attr('stroke-width', 2))
  yAxis.call(g => g.selectAll('text').attr('font-weight', '600'));

  // Draw confidence interval FIRST if needed
  const area = d3.area()
    .x(d => x(d.year))
    .y0(d => y(d.average - (d.confidence || 0)))
    .y1(d => y(d.average + (d.confidence || 0)));

  const confidenceArea = svg.append("path")
    .datum(processedData.value)
    .attr("fill", "#cce5df")
    .attr("stroke", "none")
    .attr("opacity", 0)
    .attr("d", area)
    .transition()
    .duration(1000)
    .attr("opacity", 0.8);

  const line = d3.line()
      .x(d => x(d.year))
      .y(d => y(d.average));

  svg.append("path")
    .datum(processedData.value)
    .attr("class", "line-path")
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 1.6)
    .attr("d", line);
}
</script>

<template>
  <div ref="chartRef" class="w-full"></div>
</template>

<style>
#graph-container {
  width: 100%;
  height: 100vh;
}
</style>