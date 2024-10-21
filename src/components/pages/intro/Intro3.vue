<script setup>
import { onMounted, ref, onUnmounted, watch, computed, nextTick } from 'vue';
import PageLayout from '../../layout/PageLayout.vue';
import * as d3 from 'd3';
import { useMovieStore } from '../../../stores/movieStore.js';

const movieStore = useMovieStore();

const chartRef = ref(null);
const chartWidth = ref(0);
const chartHeight = ref(600);

let resizeObserver;
let processedData = ref([]);

const processData = () => {
  if (!movieStore.movies || movieStore.movies.length === 0) {
    processedData.value = [];
    return;
  }

  let processedCount = 0;
  let skippedCount = 0;

  const yearData = {};
  movieStore.movies.forEach((movie, index) => {
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
          processedCount++;
        } else {
          skippedCount++;
        }
      } else {
        skippedCount++;
      }
    } else {
      skippedCount++;
    }
  });

  processedData.value = Object.entries(yearData).map(([year, data]) => ({
    year: parseInt(year),
    average: data.sum / data.count,
    confidence: 1.96 * d3.deviation(data.ratings) / Math.sqrt(data.count)
  })).sort((a, b) => a.year - b.year);

};

watch(() => movieStore.movies, (newMovies) => {
  if (newMovies.length > 0) {
    processData();
    nextTick(() => {
      updateChartSize();
      renderChart();
    });
  }
}, { immediate: true });

onMounted(() => {
  console.log('Intro3 component mounted');
  updateChartSize();
  renderChart();
  
  window.addEventListener('resize', () => {
    updateChartSize();
    renderChart();
  });

  if (movieStore.movies.length === 0) {
    console.log('Fetching movies');
    movieStore.fetchMovies();
  } else {
    processData();
    renderChart();
  }
});

onUnmounted(() => {
  window.removeEventListener('resize', () => {
    updateChartSize();
    renderChart();
  });
});

function updateChartSize() {
  if (chartRef.value) {
    const containerWidth = chartRef.value.parentElement.clientWidth;
    chartWidth.value = Math.max(containerWidth, 1000); // Keep the increased minimum width
    chartHeight.value = 600; // Reduced height
    console.log('Chart size updated:', chartWidth.value, chartHeight.value);
  } else {
    console.log('Cannot update chart size: no ref');
  }
}

function renderChart() {
  if (!chartRef.value || processedData.value.length === 0) {
    console.log('Cannot render chart: no ref or no data');
    return;
  }

  console.log('Rendering chart, dimensions:', chartWidth.value, chartHeight.value);

  const margin = { top: 30, right: 40, bottom: 50, left: 80 }; // Reduced top and bottom margins
  const width = chartWidth.value - margin.left - margin.right;
  const height = chartHeight.value - margin.top - margin.bottom;

  if (width <= 0 || height <= 0) {
    console.log('Cannot render chart: invalid dimensions');
    return;
  }

  d3.select(chartRef.value).selectAll("*").remove();

  const svg = d3.select(chartRef.value)
    .append("svg")
    .attr("width", chartWidth.value)
    .attr("height", chartHeight.value)
    .attr("viewBox", `0 0 ${chartWidth.value} ${chartHeight.value}`)
    .attr("preserveAspectRatio", "xMidYMid meet")
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleLinear()
    .domain(d3.extent(processedData.value, d => d.year))
    .range([0, width]);

  const y = d3.scaleLinear()
    .domain([0, d3.max(processedData.value, d => d.average + (isNaN(d.confidence) ? 0 : d.confidence))])
    .range([height, 0]);

  // X axis
  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).tickFormat(d3.format("d")))
    .style("font-size", "14px");

  // Y axis
  svg.append("g")
    .call(d3.axisLeft(y))
    .style("font-size", "14px");

  // Confidence interval area
  const area = d3.area()
    .x(d => x(d.year))
    .y0(d => y(d.average - (isNaN(d.confidence) ? 0 : d.confidence)))
    .y1(d => y(d.average + (isNaN(d.confidence) ? 0 : d.confidence)));

  svg.append("path")
    .datum(processedData.value)
    .attr("fill", "#cce5df")
    .attr("stroke", "none")
    .attr("d", area);

  // Line
  const line = d3.line()
    .x(d => x(d.year))
    .y(d => y(d.average));

  svg.append("path")
    .datum(processedData.value)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 2.5)
    .attr("d", line);

  // X axis label
  svg.append("text")
    .attr("text-anchor", "middle")
    .attr("x", width / 2)
    .attr("y", height + margin.bottom - 10)
    .text("Year")
    .style("font-size", "18px");

  // Y axis label
  svg.append("text")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .attr("y", -margin.left + 20)
    .attr("x", -height / 2)
    .text("Average Rating")
    .style("font-size", "18px");

  // Increase font sizes
  svg.selectAll("text")
    .style("font-size", "14px");

  svg.selectAll(".axis-label")
    .style("font-size", "18px");

  // Increase line thickness
  svg.selectAll("path.line")
    .attr("stroke-width", 2.5);
}

</script>

<template>
  <PageLayout>
    <div v-if="movieStore.isLoading">Daten werden geladen...</div>
    <div v-else-if="movieStore.error">Fehler beim Laden der Daten: {{ movieStore.error }}</div>
    <div v-else-if="movieStore.movies.length === 0">Keine Daten verfügbar.</div>
    <div v-else>
      <div class="w-full">
        <div id="chart-container" ref="chartRef" class="w-full h-[600px]">
          Average Ratings over Time
        </div>
      </div>
    </div>
  </PageLayout>
</template>


