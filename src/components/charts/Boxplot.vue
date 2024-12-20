<script setup>
import { ref, onMounted } from 'vue';
import { useCalcRuntimeStore } from '../../stores/calcRuntimeStore';
import * as d3 from 'd3';

const calcRuntimeStore = useCalcRuntimeStore();
const chartRef = ref(null);
const chartWidth = ref(1200);
const chartHeight = ref(400);

const MAX_Y_VALUE = 400; 

onMounted(async () => {
  if (Object.keys(calcRuntimeStore.yearlyData).length === 0) {
    await calcRuntimeStore.calculateYearlyAverages();
  }
  createChart();
});

const createChart = () => {
  if (!chartRef.value || Object.keys(calcRuntimeStore.yearlyData).length === 0) return;

  d3.select(chartRef.value).selectAll('*').remove(); 

  const margin = { top: 20, right: 0, bottom: 80, left: 40 };
  const width = Math.min(chartWidth.value - margin.left - margin.right -100, 1000);
  const height = chartHeight.value - margin.top - margin.bottom;

  const svg = d3.select(chartRef.value)
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  const yearData = calcRuntimeStore.yearlyData;
  const years = Object.keys(yearData);
  
  const y = d3.scaleLinear()
    .domain([0, Math.min(d3.max(years, year => yearData[year].max), MAX_Y_VALUE)]) 
    .range([height, 0]);

  const x = d3.scaleBand()
    .domain(years)
    .range([0, chartWidth.value - margin.left - margin.right -200])
    .paddingInner(0.1)
    .paddingOuter(0.2); 

  const filteredYears = years.filter((year, index) => year % 10 === 0);

    svg.append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(x).tickValues(filteredYears).tickFormat(d => d))
    .call(g => g.select('.domain').attr('stroke-width', 2))
    .call(g => g.selectAll('.tick line').attr('stroke-width', 2))
    .call(g => g.selectAll('text').attr('font-weight', '600'))
    .selectAll('text')
    .attr('transform', 'rotate(-45)')
    .style('text-anchor', 'end');

  svg.append('g')
    .attr('class', 'y-axis')
    .call(d3.axisLeft(y).tickPadding(10))
    .call(g => g.select('.domain').attr('stroke-width', 2))
    .call(g => g.selectAll('.tick line').attr('stroke-width', 2))
    .call(g => g.selectAll('text').attr('font-weight', '600'));

  const tooltip = d3.select('body').append('div')
    .attr('class', 'tooltip')
    .style('position', 'absolute')
    .style('visibility', 'hidden')
    .style('background-color', 'white')
    .style('border', '1px solid #ddd')
    .style('border-radius', '4px')
    .style('padding', '8px')
    .style('font-size', '12px')
    .style('box-shadow', '0 2px 4px rgba(0,0,0,0.1)')
    .style('pointer-events', 'none');

  years.forEach(year => {
    const runtimes = yearData[year].runtimes;
    if (runtimes.length === 0) return; 

    const q1 = d3.quantile(runtimes, 0.25) || 0;
    const median = d3.quantile(runtimes, 0.5) || 0;
    const q3 = d3.quantile(runtimes, 0.75) || 0;
    const min = yearData[year].min || 0;
    const max = Math.min(yearData[year].max || 0, MAX_Y_VALUE); 

    const q2 = d3.quantile(runtimes, 0.02) || 0; 
    const q5 = d3.quantile(runtimes, 0.05) || 0; 
    const q10 = d3.quantile(runtimes, 0.1) || 0; 
    const q90 = d3.quantile(runtimes, 0.9) || 0; 
    const q95 = d3.quantile(runtimes, 0.95) || 0; 
    const q98 = d3.quantile(runtimes, 0.98) || 0;

    const meanRuntime = d3.mean(runtimes) || 0;

    const rects = [
      { y: y(q3), height: y(q1) - y(q3), color: '#000080', opacity: 1 },
      { y: y(q98), height: y(q2) - y(q98), color: '#4169E1', opacity: 0.2 },
      { y: y(q95), height: y(q5) - y(q95), color: '#4169E1', opacity: 0.4 },
      { y: y(q90), height: y(q10) - y(q90), color: '#4169E1', opacity: 0.5 }
    ];

    rects.forEach(rect => {
      svg.append('rect')
        .attr('x', x(year))
        .attr('y', rect.y)
        .attr('height', rect.height)
        .attr('width', x.bandwidth())
        .attr('fill', rect.color)
        .attr('opacity', rect.opacity)
        .on('mouseover', () => {
          tooltip.style('visibility', 'visible')
            .html(`
              <strong>Year:</strong> ${year}<br/>
              <strong>Number of Movies:</strong> ${runtimes.length}<br/>
              <strong>Mean Runtime:</strong> ${meanRuntime.toFixed(2)} minutes
            `);
        })
        .on('mousemove', (event) => {
          tooltip.style('top', (event.pageY - 10) + 'px')
            .style('left', (event.pageX + 10) + 'px');
        })
        .on('mouseout', () => {
          tooltip.style('visibility', 'hidden');
        });
    });

    svg.append('line')
      .attr('x1', x(year))
      .attr('x2', x(year) + x.bandwidth())
      .attr('y1', y(median))
      .attr('y2', y(median))
      .attr('stroke', '#000033')
      .attr('stroke-width', 2);
  });

  const legendData = [
    { color: '#4169E1', label: 'Percentile 2 - 98', opacity: 0.2 },
    { color: '#4169E1', label: 'Percentile 5 - 95', opacity: 0.4 },
    { color: '#4169E1', label: 'Percentile 10 - 90', opacity: 0.5 },
    { color: '#000080', label: 'Percentile 25 - 75' },
  ];

  const legend = svg.append('g')
    .attr('class', 'legend')
    .attr('transform', `translate(${width - 180}, 20)`); 

  legend.selectAll('rect')
    .data(legendData)
    .enter()
    .append('rect')
    .attr('x', 0)
    .attr('y', (d, i) => i * 20)
    .attr('width', 18)
    .attr('height', 18)
    .attr('fill', d => d.color)
    .attr('opacity', d => d.opacity || 1);

  legend.selectAll('text')
    .data(legendData)
    .enter()
    .append('text')
    .attr('x', 24)
    .attr('y', (d, i) => i * 20 + 9)
    .attr('dy', '0.35em')
    .text(d => d.label);
};


</script>

<template>
  <div ref="chartRef" class="w-full flex h-[400px]"></div>
</template>

<style>
#boxplot {
  background-color: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: flex;
}
.tooltip {
  position: absolute;
  visibility: hidden;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 8px;
  font-size: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  pointer-events: none;
}
</style> 