<script setup>
import { onMounted, ref, onUnmounted, watch, nextTick } from 'vue';
import * as d3 from 'd3';

const props = defineProps({
  movies: {
    type: Array,
    required: true
  },
  showConfidence: {
    type: Boolean,
    default: false
  },
  showAnnotation: {
    type: Boolean,
    default: false
  },
  animateAnnotation: {
    type: Boolean,
    default: false
  },
  animateAnnotation2: {
    type: Boolean,
    default: false
  },
  scaleXAxis: {
    type: Boolean,
    default: false
  },
  animateConfidence: {
    type: Boolean,
    default: true
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
  if (newMovies.length > 0) {
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
    .domain(d3.extent(processedData.value, d => d.year))
    .range([0, width]);

  const y = d3.scaleLinear()
    .domain([1, 10])
    .range([height, 0]);

  // X axis with slightly thinner lines
  const xAxis = svg.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${height-1})`);

  const xAxisGroup = xAxis.call(d3.axisBottom(x).tickFormat(d3.format("d")));

  xAxisGroup.call(g => g.select('.domain').attr('stroke-width', 2))
  xAxisGroup.call(g => g.selectAll('.tick line').attr('stroke-width', 2))
  xAxisGroup.call(g => g.selectAll('text').attr('font-weight', '600'));

  // Y axis with thicker lines
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
    //.attr("class", "line-path")
    .attr("fill", "#cce5df")
    .attr("stroke", "none")
    .attr("opacity", props.animateConfidence ? 0 : 0.8)
    .attr("d", area);

  const line = d3.line()
      .x(d => x(d.year))
      .y(d => y(d.average));

  const chartGroup = svg.append("g")
      .attr("clip-path", "url(#clip)");

  if (!props.showConfidence) {
    // First page: Animate the line from left to right
    svg.append("defs")
      .append("clipPath")
      .attr("id", "clip")
      .append("rect")
      .attr("width", 0)
      .attr("height", height)
      .transition()
      .duration(1000)
      .attr("width", width);

    chartGroup.append("path")
      .datum(processedData.value)
      .attr("class", "line-path")
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 1.6)
      .attr("d", line);

  } else {
    // Only animate opacity on Time2
    if (props.animateConfidence && !props.showAnnotation && !props.showLimitedData && !props.scaleXAxis) {
      confidenceArea
        .attr("opacity", 0)
        .transition()
        .duration(1000)
        .attr("opacity", 0.8);
    } else {
      confidenceArea.attr("opacity", 0.8);
    }

    svg.append("path")
      .datum(processedData.value)
      .attr("class", "line-path")
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 1.6)
      .attr("d", line);
  }

  // Add annotation if showAnnotation is true
  if (props.showAnnotation) {
    const annotationYear = 1906;
    const targetY = 7.5;
    const annotationYear2 = 1899;
    const targetY2 = 3.7;
    
    // Add arrowhead marker
    svg.append("defs").append("marker")
      .attr("id", "arrow")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 5)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "steelblue");

    // Add arrow from above
    const arrow = svg.append("path")
      .attr("d", d3.line()([[x(annotationYear), y(targetY) - 30], 
                           [x(annotationYear), y(targetY) - 10]]))
      .attr("opacity", 0)
      .attr("stroke", "steelblue")
      .attr("stroke-width", 2)
      .attr("marker-end", "url(#arrow)");

    // Add arrow from above
    const arrow2 = svg.append("path")
      .attr("d", d3.line()([[x(annotationYear2) + 10, y(targetY2) + 35], 
                           [x(annotationYear2) + 3, y(targetY2) + 5]]))
      .attr("opacity", 0)
      .attr("stroke", "steelblue")
      .attr("stroke-width", 2)
      .attr("marker-end", "url(#arrow)");

    // Add annotation text above
    const text = svg.append("text")
      .attr("x", x(annotationYear))
      .attr("y", y(targetY) - 40)
      .attr("opacity", 0)
      .attr("text-anchor", "middle")
      .attr("fill", "steelblue")
      .attr("font-size", "14px")
      .attr("font-weight", "bold")
      .text("High uncertainty");

    const text2 = svg.append("text")
      .attr("x", x(annotationYear2) + 67)
      .attr("y", y(targetY2) + 55)
      .attr("opacity", 0)
      .attr("text-anchor", "middle")
      .attr("fill", "steelblue")
      .attr("font-size", "14px")
      .attr("font-weight", "bold")
      .text("Interval undefined");

    if (props.animateAnnotation && !props.animateAnnotation2) {
      arrow.attr("opacity", 0)
        .transition()
        .duration(800)
        .attr("opacity", 1);

      text.attr("opacity", 0)
        .transition()
        .duration(800)
        .attr("opacity", 1);
    } else  if (!props.animateAnnotation && props.animateAnnotation2) {
      arrow.attr("opacity", 0);

      text.attr("opacity", 0);

      arrow2.attr("opacity", 0)
        .transition()
        .duration(800)
        .attr("opacity", 1);

      text2.attr("opacity", 0)
        .transition()
        .duration(800)
        .attr("opacity", 1);
    } else {
      arrow.attr("opacity", 0);
      text.attr("opacity", 0);
      arrow2.attr("opacity", 0);
      text2.attr("opacity", 0);
    }
  }

  // Fifth page: Scale x axis
  if (props.scaleXAxis) {
    confidenceArea
      .attr("opacity", 0.8)
      .transition()
      .duration(100)
      .attr("opacity", 0);

    x.domain([1950, d3.max(processedData.value, d => d.year)]); 
    xAxis.transition()
      .duration(1000)
      .call(d3.axisBottom(x).tickFormat(d3.format("d")));
    
    svg.selectAll('.line-path')
      .datum(processedData.value)
      .transition()
      .duration(1000)
      .attr('d', line);
  }
  
}
</script>

<template>
  <div ref="chartRef" class="w-full"></div>
</template>
