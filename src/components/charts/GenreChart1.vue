<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import * as d3 from 'd3';
import { useNavigationStore } from '../../stores/navigationStore.js';
import { useCalcGenreAvgStore } from '../../stores/calcGenreAvgStore.js'

const navigationStore = useNavigationStore();
const chartRef = ref(null);
const chartWidth = ref(0);
const chartHeight = ref(400);

const updateChartSize = () => {
  if (chartRef.value) {
    chartWidth.value = chartRef.value.clientWidth || 600;
    chartHeight.value = chartRef.value.clientHeight || 400;
  }
};

const handleResize = () => {
  updateChartSize();
  createChart();
};

const createChart = () => {
  if (!chartRef.value) return;

  d3.select(chartRef.value).selectAll('svg').remove();

  const margin = { top: 20, right: 30, bottom: 80, left: 40 };
  const width = Math.min(chartWidth.value - margin.left - margin.right, 1200);
  const height = chartHeight.value - margin.top - margin.bottom;

  const svg = d3.select(chartRef.value)
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  const y = d3.scaleLinear()
    .domain([1, 10])
    .range([height, 0]);

  svg.append('g')
    .call(d3.axisLeft(y).tickPadding(10))
    .call(g => g.select('.domain').attr('stroke-width', 2))
    .call(g => g.selectAll('.tick line').attr('stroke-width', 2))
    .call(g => g.selectAll('text').attr('font-weight', '600'));

  if (navigationStore.currentPage === 'Genre1' || navigationStore.currentPage === 'Genre2') {
    createGenre1Chart(svg, width, height, y);
  } else if (navigationStore.currentPage === 'Genre3') {
    createGenre3Chart(svg, width, height, y);
  }
};

const createGenre1Chart = (svg, width, height, y) => {
  const arrowPoints = [
    { value: 8.7 },
    { value: 5.3 }
  ];

  svg.selectAll('.arrow')
    .data(arrowPoints)
    .enter()
    .append('line')
    .attr('class', 'arrow')
    .attr('x1', 50)
    .attr('y1', d => y(d.value))
    .attr('y2', d => y(d.value))
    .attr('stroke', 'black')
    .attr('stroke-width', 1.6)
    .attr('marker-end', 'url(#arrow)')
    .attr('x2', 8);

  svg.append('defs').append('marker')
    .attr('id', 'arrow')
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', 8)
    .attr('refY', 0)
    .attr('markerWidth', 6)
    .attr('markerHeight', 6)
    .attr('orient', 'auto')
    .append('path')
    .attr('d', 'M0,-5L10,0L0,5')
    .attr('fill', 'black');
};

const createGenre3Chart = (svg, width, height, y) => {
  const genreAvgStore = useCalcGenreAvgStore()
  
  const data = Object.entries(genreAvgStore.genreAverages).map(([genre, value]) => ({
    genre,
    value
  }))
  
  const genres = data.map(d => d.genre)
  
  const x = d3.scaleBand()
    .range([0, width])
    .domain(genres)
    .padding(0)

  const xAxis = svg.append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(0,${height-1})`)

  const xAxisGroup = xAxis.call(d3.axisBottom(x))

  xAxisGroup.call(g => g.select('.domain').attr('stroke-width', 4))
  xAxisGroup.call(g => g.selectAll('.tick line').attr('stroke-width', 2))
  xAxisGroup.call(g => g.selectAll('text').attr('font-weight', '600'))

  svg.append('clipPath')
    .attr('id', 'x-axis-clip')
    .append('rect')
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', 0)
    .attr('height', height + 50)

  xAxisGroup.attr('clip-path', 'url(#x-axis-clip)')

  xAxisGroup.selectAll('text')
    .attr('transform', 'translate(-10,5)rotate(-45)')
    .style('text-anchor', 'end')

  svg.select('#x-axis-clip rect')
    .transition()
    .duration(400)
    .attr('width', width)

  svg.selectAll('.arrow')
    .transition()
    .duration(1)
    .attr('x1', (d, i) => x(genres[i]))
    .attr('x2', (d, i) => x(genres[i]))
    .attr('y2', height)
    .remove()

  svg.selectAll('.arrow-label')
    .transition()
    .duration(100)
    .attr('x', (d, i) => x(genres[i]))
    .attr('y', height + 20)
    .remove()

  svg.selectAll('.point')
    .data(data)
    .enter()
    .append('circle')
    .attr('class', 'point')
    .attr('cx', d => x(d.genre) + x.bandwidth() / 2)
    .attr('cy', height)
    .attr('r', 0)
    .attr('fill', 'steelblue')
    .transition()
    .duration(200)
    .delay((d, i) => i * 30 + 200)
    .attr('cy', d => y(d.value))
    .attr('r', 5)
}

onMounted(() => {
  updateChartSize();
  createChart();
  window.addEventListener('resize', handleResize);
});

watch(() => navigationStore.currentPage, () => {
  createChart();
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});
</script>

<template>
  <div ref="chartRef" class="w-full h-[400px]"></div>
</template>
