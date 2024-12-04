<script setup>
import { onMounted, watch } from 'vue';
import * as d3 from 'd3';
import cloud from 'd3-cloud';
import { useCalcGenreAvgStore } from '../../../stores/calcGenreAvgStore';

const genreAvgStore = useCalcGenreAvgStore();

onMounted(() => {
  if (Object.keys(genreAvgStore.genreAverages).length > 0) {
    createWordCloud();
  }
});

watch(() => genreAvgStore.genreAverages, (newValue) => {
  if (Object.keys(newValue).length > 0) {
    d3.select('#word-cloud').selectAll('*').remove();
    createWordCloud();
  }
}, { deep: true });

function createWordCloud() {
  const genres = Object.keys(genreAvgStore.genreAverages);
  
  const amounts = genres.map(genre => genreAvgStore.genreAverages[genre].amount);
  const minAmount = Math.min(...amounts);
  const maxAmount = Math.max(...amounts);
  
  const fontScale = d3.scaleLinear()
    .domain([minAmount, maxAmount])
    .range([12, 60]);

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

  const layout = cloud()
    .size([250, 350])
    .words(genres.map(genre => ({
      text: genre,
      size: fontScale(genreAvgStore.genreAverages[genre].amount),
      amount: genreAvgStore.genreAverages[genre].amount
    })))
    .padding(5)
    .rotate(() => ~~(Math.random() * 2) * 90)
    .fontSize(d => d.size)
    .on('end', draw);

  layout.start();

  function draw(words) {
    const svg = d3.select('#word-cloud')
      .append('svg')
      .attr('width', layout.size()[0])
      .attr('height', layout.size()[1])
      .append('g')
      .attr('transform', `translate(${layout.size()[0] / 2},${layout.size()[1] / 2})`);

    const tooltip = d3.select('body')
      .append('div')
      .attr('class', 'tooltip')
      .style('position', 'absolute')
      .style('background-color', 'white')
      .style('padding', '5px')
      .style('border', '1px solid #ccc')
      .style('border-radius', '5px')
      .style('pointer-events', 'none')
      .style('opacity', 0);

    svg.selectAll('text')
      .data(words)
      .enter().append('text')
      .style('font-size', d => `${d.size}px`)
      .style('fill', (d, i) => color(i))
      .attr('text-anchor', 'middle')
      .attr('transform', d => `translate(${d.x},${d.y})rotate(${d.rotate})`)
      .text(d => d.text)
      .on('mouseover', (event, d) => {
        tooltip.style('opacity', 1)
          .html(`Genre: ${d.text}<br>Amount: ${d.amount}`)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mousemove', (event) => {
        tooltip.style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', () => {
        tooltip.style('opacity', 0);
      });
  }
}
</script>

<template>
  <div id="word-cloud"></div>
</template>

<style scoped>
.tooltip {
  position: absolute;
  background-color: white;
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: 5px;
  pointer-events: none;
  opacity: 0;
}
</style>
