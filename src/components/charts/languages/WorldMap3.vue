<script setup>
import * as d3 from 'd3';
import { onMounted, ref } from 'vue';

const mapSvg = ref(null);
const legendSvg = ref(null);

const createLegend = () => {
  const width = 60;
  const height = 200;
  const legendWidth = 20;
  const legendMargin = { top: 10, right: 10, bottom: 10, left: 10 };

  const svg = d3.select(legendSvg.value)
    .attr('width', width)
    .attr('height', height);

  const legend = svg.append('g')
    .attr('class', 'legend')
    .attr('transform', `translate(${legendMargin.left}, ${legendMargin.top})`);

  const gradient = legend.append('defs')
    .append('linearGradient')
    .attr('id', 'legend-gradient')
    .attr('x1', '0%')
    .attr('y1', '100%')
    .attr('x2', '0%')
    .attr('y2', '0%');

  gradient.append('stop')
    .attr('offset', '0%')
    .attr('stop-color', d3.interpolateBuGn(0))
    .attr('stop-opacity', 1);

  gradient.append('stop')
    .attr('offset', '100%')
    .attr('stop-color', d3.interpolateBuGn(1))
    .attr('stop-opacity', 1);

  legend.append('rect')
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', legendWidth)
    .attr('height', height - legendMargin.top - legendMargin.bottom)
    .style('fill', 'url(#legend-gradient)');

  const legendScale = d3.scaleLinear()
    .domain([0, 100])
    .range([height - legendMargin.top - legendMargin.bottom, 0]);

  const legendAxis = d3.axisRight(legendScale)
    .tickValues([0, 20, 40, 60, 80, 100])
    .tickFormat(d => `${d}%`);

  legend.append('g')
    .attr('class', 'legend-axis')
    .attr('transform', `translate(${legendWidth}, 0)`)
    .call(legendAxis);
};

const createMap = async () => {
  const width = 960;
  const height = 500;

  const regionData = await d3.csv(new URL('@/assets/data/RegionCounts.csv', import.meta.url).href);
  const languageData = await d3.csv(new URL('@/assets/data/LanguageCounts.csv', import.meta.url).href);
  
  const regionMap = new Map(regionData.map(d => [d.country_iso, d]));
  const languageMap = new Map(languageData.map(d => [d.country_language, +d.amount_movies]));

  const colorScale = d3.scaleSequential(d3.interpolateBuGn)
    .domain([0, 1000]);

  const svg = d3.select(mapSvg.value)
    .attr('width', width)
    .attr('height', height);

  const tooltip = d3.select('body').append('div')
    .attr('class', 'tooltip')
    .style('visibility', 'hidden')
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
      g.selectAll('path')
        .attr('transform', event.transform);
      g.selectAll('text')
        .attr('transform', event.transform)
        .style('font-size', `${10 / event.transform.k}px`);
    });

  svg.call(zoom);

  try {
    const response = await fetch('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson');
    const data = await response.json();

    const paths = g.selectAll('path')
      .data(data.features)
      .enter()
      .append('path')
      .attr('d', path)
      .attr('fill', d => {
        const countryCode = d.id;
        return regionMap.has(countryCode) ? '#69b3a2' : '#d3d3d3';
      })
      .attr('stroke', '#fff')
      .attr('stroke-width', 0.5)
      .on('mouseover', function(event, d) {
        const countryCode = d.id;
        const regionInfo = regionMap.get(countryCode);
        
        d3.select(this)
          .transition()
          .duration(200)
          .attr('fill', d => {
            if (regionInfo) {
              const movieCount = languageMap.get(regionInfo.country_language);
              return movieCount !== undefined ? d3.color(colorScale(movieCount)).darker(0.2) : '#b5b5b5';
            }
            return '#b5b5b5';
          });
        
        tooltip
          .style('visibility', 'visible')
          .html(`${regionInfo.country_name}<br/>
                 Language: ${regionInfo.country_language}<br/>
                 Movies: ${languageMap.get(regionInfo.country_language)}<br/>
                 Percentage: ${Math.round((languageMap.get(regionInfo.country_language) / 1000) * 100)}%`)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', function(event, d) {
        const countryCode = d.id;
        const regionInfo = regionMap.get(countryCode);
        
        d3.select(this)
          .transition()
          .duration(200)
          .attr('fill', d => {
            if (regionInfo) {
              const movieCount = languageMap.get(regionInfo.country_language);
              return movieCount !== undefined ? colorScale(movieCount) : '#d3d3d3';
            }
            return '#d3d3d3';
          });
        
        tooltip.style('visibility', 'hidden');
      })
      .on('mousemove', function(event) {
        tooltip
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      });

    setTimeout(() => {
      paths.transition()
        .duration(1000)
        .attr('fill', d => {
          const countryCode = d.id;
          const regionInfo = regionMap.get(countryCode);
          if (regionInfo) {
            const movieCount = languageMap.get(regionInfo.country_language);
            return movieCount !== undefined ? colorScale(movieCount) : '#d3d3d3';
          }
          return '#d3d3d3';
        });
    }, 10);

  } catch (error) {
    console.error('Fehler beim Laden der Kartendaten:', error);
  }
};

onMounted(() => {
  createMap();
  createLegend();
});
</script>

<template>
  <div class="world-map-container">
    <svg ref="mapSvg"></svg>
    <svg ref="legendSvg" class="legend-svg"></svg>
  </div>
</template>

<style scoped>
.world-map-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
}

svg {
  height: 100%;
}

.legend-svg {
  width: 80px;
  margin-left: 10px;
}
</style>