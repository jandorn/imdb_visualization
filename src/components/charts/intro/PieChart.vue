<script setup>
import { onMounted, ref } from 'vue';
import * as d3 from 'd3';

const data = [
  { type: 'Movie', count: 690227 },
  { type: 'TV Series', count: 270752, episodes: 8425740 },
  { type: 'Short', count: 1028843 },
  { type: 'Video Game', count: 40357 },
  { type: 'Video', count: 194020 },
  { type: 'Music Video', count: 180621 },
  { type: 'Podcast Series', count: 66266, episodes: 10332211 }
];

const width = 200;
const height = 200;
const padding = 20;
const radius = Math.min(width, height) / 2 - padding;

onMounted(() => {
  const svg = d3.select('#pie-chart')
    .append('svg')
    .attr('width', width + padding * 2)
    .attr('height', height + padding * 2)
    .append('g')
    .attr('transform', `translate(${width / 2 + padding},${height / 2 + padding})`);

  const color = d3.scaleOrdinal()
    .range([
      '#4e79a7',
      '#f28e2c',
      '#e15759',
      '#76b7b2',
      '#59a14f',
      '#edc949',
      '#af7aa1',
      '#ff9da7',
      '#9c755f',
      '#bab0ab'
    ]);

  const pie = d3.pie()
    .value(d => d.count)
    .sort(null);

  const arc = d3.arc()
    .innerRadius(0)
    .outerRadius(radius);

  const tooltip = d3.select('body')
    .append('div')
    .attr('class', 'tooltip')
    .style('position', 'absolute')
    .style('background-color', 'white')
    .style('padding', '10px')
    .style('border', '1px solid #ccc')
    .style('border-radius', '5px')
    .style('pointer-events', 'none')
    .style('opacity', 0);

  const arcs = svg.selectAll('path')
    .data(pie(data))
    .enter()
    .append('path')
    .attr('d', arc)
    .attr('fill', (d, i) => color(i))
    .on('mousemove', (event, d) => {
      let tooltipContent = `${d.data.type}: ${d.data.count.toLocaleString()}`;
      if (d.data.episodes) {
        tooltipContent += `<br>Episodes: ${d.data.episodes.toLocaleString()}`;
      }
      
      tooltip.transition()
        .duration(200)
        .style('opacity', .9);
      
      tooltip.html(tooltipContent)
        .style('left', (event.pageX + 15) + 'px')
        .style('top', (event.pageY) + 'px');

      d3.select(event.currentTarget)
        .transition()
        .duration(100)
        .attr('transform', `scale(1.05)`);
    })
    .on('mouseout', (event) => {
      tooltip.transition()
        .duration(500)
        .style('opacity', 0);

      d3.select(event.currentTarget)
        .transition()
        .duration(100)
        .attr('transform', `scale(1)`);
    });

  const labelArc = d3.arc()
    .innerRadius(radius * 0.6)
    .outerRadius(radius * 0.6);

  const total = data.reduce((sum, d) => sum + d.count, 0);

  const labels = svg.selectAll('text')
    .data(pie(data))
    .enter()
    .append('text')
    .attr('transform', d => `translate(${labelArc.centroid(d)})`)
    .attr('dy', '0.35em')
    .attr('text-anchor', 'middle')
    .style('font-size', '12px')
    .style('cursor', 'pointer')
    .style('fill', 'white')
    .text(d => d.data.count > (total * 0.075) ? d.data.type : '')
    .on('mousemove', (event, d) => {
      let tooltipContent = `${d.data.type}: ${d.data.count.toLocaleString()}`;
      if (d.data.episodes) {
        tooltipContent += `<br>Episodes: ${d.data.episodes.toLocaleString()}`;
      }
      
      tooltip.transition()
        .duration(200)
        .style('opacity', .9);
      
      tooltip.html(tooltipContent)
        .style('left', (event.pageX + 15) + 'px')
        .style('top', (event.pageY) + 'px');

      svg.selectAll('path')
        .filter((pathData) => pathData.data.type === d.data.type)
        .transition()
        .duration(200)
        .attr('transform', `scale(1.05)`);
    })
    .on('mouseout', (event, d) => {
      tooltip.transition()
        .duration(500)
        .style('opacity', 0);

      svg.selectAll('path')
        .transition()
        .duration(200)
        .attr('transform', `scale(1)`);
    });

});
</script>

<template>
  <div id="pie-chart" style="overflow: visible;"></div>
</template>

<style scoped>
.tooltip {
  overflow: visible;
}
</style>
