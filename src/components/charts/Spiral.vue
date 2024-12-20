<script setup>
import { ref, onMounted, watchEffect } from 'vue';
import * as d3 from 'd3';

const props = defineProps({
  spiralData: {
    type: Array,
    required: true
  },
  tooltip: {
    type: Object,
    required: true
  },
  showTooltip: {
    type: Function,
    required: true
  },
  hideTooltip: {
    type: Function,
    required: true
  },
  isZoomedIn: {
    type: Boolean,
    required: true
  }
});

let svg, g;

onMounted(() => {
  svg = d3.select("#spiral");
  g = svg.append("g");

  props.spiralData.forEach(point => {
    g.append("circle")
      .attr("cx", point.x)
      .attr("cy", point.y)
      .attr("r", Math.sqrt(point.runtime) * 0.08)
      .attr("fill", point.color)
      .on("mouseover", (event) => props.showTooltip(event, point))
      .on("mouseleave", props.hideTooltip);
  });
});

watchEffect(() => {
  if (!props.spiralData || props.spiralData.length === 0) return;

  const zoomTarget = { x: -100, y: -100 };
  const scale = props.isZoomedIn ? 3 : 1;

  g.transition()
    .duration(750)
    .attr("transform", `translate(${props.isZoomedIn ? 0 : zoomTarget.x}, ${props.isZoomedIn ? 0 : zoomTarget.y}) scale(${scale})`);
});
</script>

<template>
  <svg id="spiral" width="800" height="800" viewBox="-450 -450 900 900">
    <g></g>
  </svg>

  <div v-if="tooltip.visible" 
       class="tooltip" 
       :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }">
    <strong>{{ tooltip.title }}</strong><br>
    Year: {{ tooltip.year }}<br>
    Runtime: {{ tooltip.runtime }} mins
  </div>
</template>

<style>
#spiral {
  background-color: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 50%;
}

.tooltip {
  position: absolute;
  background-color: white;
  border: 1px solid #ccc;
  padding: 8px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  pointer-events: none; 
}
</style> 