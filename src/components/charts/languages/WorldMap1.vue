<script setup>
import * as d3 from 'd3';
import { onMounted, ref } from 'vue';

const mapSvg = ref(null);

const createMap = async () => {
  const width = 960;
  const height = 500;

  const svg = d3.select(mapSvg.value)
    .attr('width', width)
    .attr('height', height);

  const tooltip = d3.select('body').append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0)
    .style('position', 'absolute')
    .style('background-color', 'white')
    .style('border', '1px solid #ddd')
    .style('padding', '6px')
    .style('border-radius', '3px')
    .style('pointer-events', 'none');

  const g = svg.append('g');

  const projection = d3.geoMercator()
    .scale(150)
    .center([0, 20])
    .translate([width / 2, height / 2]);

  const path = d3.geoPath().projection(projection);

  const zoom = d3.zoom()
    .scaleExtent([1, 8])
    .on('zoom', (event) => {
      g.attr('transform', event.transform);
    });

  svg.call(zoom);

  try {
    const response = await fetch('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson');
    const data = await response.json();

    g.selectAll('path')
      .data(data.features)
      .enter()
      .append('path')
      .attr('d', path)
      .attr('fill', '#69b3a2')
      .attr('stroke', '#fff')
      .attr('stroke-width', 0.5)
      .on('mouseover', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('fill', '#4a7c71');
        
        tooltip.transition()
          .duration(200)
          .style('opacity', .9);
        
        tooltip.html(d.properties.name)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('fill', '#69b3a2');
        
        tooltip.transition()
          .duration(500)
          .style('opacity', 0);
      })
      .on('mousemove', function(event) {
        tooltip
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      });
  } catch (error) {
    console.error('Fehler beim Laden der Kartendaten:', error);
  }
};

onMounted(() => {
  createMap();
});
</script>

<template>
  <div class="world-map-container">
    <svg ref="mapSvg"></svg>
  </div>
</template>

<style scoped>
.world-map-container {
  width: 100%;
  height: 100%;
}

svg {
  width: 100%;
  height: 100%;
}
</style>
