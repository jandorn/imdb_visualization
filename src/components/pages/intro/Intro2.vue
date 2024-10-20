<script setup>
import { onMounted, ref, onUnmounted, computed, watch } from 'vue';
import PageLayout from '../../layout/PageLayout.vue';
import { drag as d3Drag } from 'd3-drag';
import { select as d3Select } from 'd3-selection';
import * as d3 from 'd3';
import { useMovieStore } from '../../../stores/movieStore.js';

const movieStore = useMovieStore();

const chartRef = ref(null);
const chartWidth = ref(0);
const chartHeight = ref(600);

const scaleOpacity = (value) => {
  if (minWeight === maxWeight) return 1;
  return (value - minWeight) / (maxWeight - minWeight);
};

const drag = simulation => {
  function dragstarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }
  
  function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
  }
  
  function dragended(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }
  
  return d3Drag()
    .on("start", dragstarted)
    .on("drag", dragged)
    .on("end", dragended);
}

let nodes = ref([]);
let links = ref([]);

let resizeObserver;

const computeAdjacencyList = () => {
  const genreOccurrences = {};
  const genrePairs = {};
  
  movieStore.movies.forEach(movie => {
    if (movie.genres && movie.genres.trim() !== "") {
      const genres = movie.genres.split(',');  
      genres.forEach(genre => {
        genreOccurrences[genre] = (genreOccurrences[genre] || 0) + 1;
      });

      // step 2: Create genre pairs and count co-occurrences
      for (let i = 0; i < genres.length; i++) {
        for (let j = i + 1; j < genres.length; j++) {
          const pairKey = [genres[i], genres[j]].sort().join('-');
          genrePairs[pairKey] = (genrePairs[pairKey] || { count: 0, genres: [genres[i], genres[j]] });
          genrePairs[pairKey].count += 1;
        }
      }
    }
  });

  // step 3: prepare the nodes
  nodes.value = Object.keys(genreOccurrences).map(genre => ({
    id: genre,
    count: genreOccurrences[genre]
  }));

  // Step 4 prepare the edges with Jaccard index as weight
  links.value = Object.values(genrePairs).map(pair => {
    const [genre1, genre2] = pair.genres;
    const intersectionCount = pair.count;
    const unionCount = genreOccurrences[genre1] + genreOccurrences[genre2] - intersectionCount;
    const jaccardIndex = intersectionCount / unionCount;

    return { source: genre1, target: genre2, weight: jaccardIndex };
  });
};

watch(() => movieStore.movies, (newMovies) => {
  if (newMovies.length > 0) {
    computeAdjacencyList();
    updateChartSize();
    renderForceSimulation();
  }
}, { immediate: true });

onMounted(() => {
  updateChartSize();
  
  resizeObserver = new ResizeObserver(() => {
    updateChartSize();
    renderForceSimulation();
  });

  if (chartRef.value) {
    resizeObserver.observe(chartRef.value);
  }

  if (movieStore.movies.length === 0) {
    movieStore.fetchMovies();
  }
});

function updateChartSize() {
  if (chartRef.value) {
    chartWidth.value = chartRef.value.clientWidth;
  }
}

function renderForceSimulation() {
  d3.select(chartRef.value).selectAll("svg").remove();

  const svg = d3.select(chartRef.value)
    .append('svg')
    .attr('width', chartWidth.value)
    .attr('height', chartHeight.value);

  const simulation = d3.forceSimulation(nodes.value)
    .force("link", d3.forceLink(links.value).id(d => d.id).distance(300)) 
    .force("charge", d3.forceManyBody().strength(-200)) 
    .force("center", d3.forceCenter(0, 0))
    .force("collision", d3.forceCollide().radius(d => Math.sqrt(d.count) * 0.3 + 5)) 
    .alpha(0.2)  
    .alphaDecay(0.05); 

  const scaleFactor = 1; 
  const graphGroup = svg.append('g')
    .attr('transform', `translate(${chartWidth.value / 2}, ${chartHeight.value / 2}) scale(${scaleFactor})`);

  const weights = links.value.map(d => d.weight);
  const minWeight = Math.min(...weights);
  const maxWeight = Math.max(...weights);

  const scaleOpacity = (value) => {
    if (minWeight === maxWeight) return 1; // Avoid division by zero
    return (value - minWeight) / (maxWeight - minWeight);
  };

  const link = graphGroup.append("g")
    .selectAll("line")
    .data(links.value)
    .join("line")
    .attr("stroke", "#999")
    .attr("stroke-opacity", d => scaleOpacity(d.weight))
    .attr('stroke-width', d => d.weight * 100); 

    const node = graphGroup.append("g")
    .selectAll("g")
    .data(nodes.value)
    .join("g")
    .call(drag(simulation));

  node.append("circle")
    .attr('r', d => Math.sqrt(d.count) * 0.3)
    .attr("fill", "#F5C519");

  node.append("text")
    .text(d => d.id)
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "central")
    .attr("font-size", "10px")
    .attr("fill", "black");

  simulation.on("tick", () => {
    link
      .attr("x1", d => d.source.x)
      .attr("y1", d => d.source.y)
      .attr("x2", d => d.target.x)
      .attr("y2", d => d.target.y);

    node
      .attr("transform", d => `translate(${d.x},${d.y})`);
  });

  /*
  svg.on("mousemove", (event) => {
  const [x, y] = d3.pointer(event);
  
  simulation.force("mouse", d3.forceX().x(d => {
    const dx = x - d.x;
    const dy = y - d.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 50) {  // 
      return d.x - dx * 2 / distance;  
    }
    return d.x;
  }).strength(0.1));  

  simulation.force("mouse-y", d3.forceY().y(d => {
    const dx = x - d.x;
    const dy = y - d.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 100) {  
      return d.y - dy * 5 / distance;  
    }
    return d.y;
  }).strength(0.1));  

  simulation.alpha(0.2).restart();  
  
});

  svg.on("mouseleave", () => {
    simulation.force("mouse", null);
    simulation.force("mouse-y", null);
    simulation.alpha(0.2).restart();
  });
  */
}

function renderGraph() {
  console.log("Nodes data:", nodes.value);

  const svg = d3.select(chartRef.value)
    .append('svg')
    .attr('width', chartWidth.value)
    .attr('height', chartHeight.value)
    .attr('viewBox', [0, 0, chartWidth.value, chartHeight.value])
    .style('border', '1px solid #ccc');

  const graphGroup = svg.append('g')
    .attr('transform', `translate(${chartWidth.value / 2}, ${chartHeight.value / 2}) scale(1)`);

  const link = graphGroup.append("g")
    .selectAll("line")
    .data(links.value)
    .join("line")
    .attr("stroke", "#999")
    .attr("stroke-opacity", d => scaleOpacity(d.weight))
    .attr('stroke-width', d => scaleOpacity(d.weight) * 5);

  const node = graphGroup.append("g")
    .selectAll("g")
    .data(nodes.value)
    .join("g")
    .call(drag(simulation));

  console.log("Number of nodes:", node.size());

  node.append("circle")
    .attr('r', d => Math.sqrt(d.count) * 0.3)
    .attr("fill", "#F5C519");

  node.append("text")
    .text(d => {
      console.log("Node data:", d);
      return d.genre || d.id || "Unknown";
    })
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "central")
    .attr("font-size", "12px")
    .attr("fill", "black")
    .attr("pointer-events", "none");

  function ticked() {
    link
      .attr("x1", d => d.source.x)
      .attr("y1", d => d.source.y)
      .attr("x2", d => d.target.x)
      .attr("y2", d => d.target.y);

    node.attr("transform", d => `translate(${d.x},${d.y})`);
    
    // Explicitly update text position
    node.select("text")
      .attr("x", 0)
      .attr("y", 0);
  }

  const simulation = d3.forceSimulation(nodes.value)
    .force("link", d3.forceLink(links.value).id(d => d.id).distance(100))
    .force("charge", d3.forceManyBody().strength(-200))
    .force("center", d3.forceCenter(0, 0))
    .force("collision", d3.forceCollide().radius(d => Math.sqrt(d.count) * 0.3 + 5));

  simulation.on("tick", ticked);

  // Force an immediate update
  simulation.tick(10);
  ticked();
}

onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect();
  }
});
</script>

<template>
  <PageLayout>
    <div v-if="movieStore.isLoading">Daten werden geladen...</div>
    <div v-else-if="movieStore.error">Fehler beim Laden der Daten: {{ movieStore.error }}</div>
    <div v-else>
      <div class="flex justify-center w-full">
        <div ref="chartRef" class="w-full h-[600px]"></div>
      </div>
      In commodo occaecat est laborum ullamco cillum proident duis proident et commodo.
      Nulla incididunt consequat sunt eu duis officia irure incididunt.
      Est sit esse eiusmod tempor ea nulla ut duis voluptate sit.
      Adipisicing qui est in consectetur eu eu non anim aute sunt tempor dolore magna.
      Dolore dolor laboris consectetur sint veniam anim quis. 
      Sunt amet ullamco dolor Lorem labore veniam qui qui cupidatat eiusmod sint in Lorem esse.
      Veniam duis irure exercitation qui. <br><br>
    </div>
  </PageLayout>
</template>

<style>
#graph-container {
  width: 100%;
  height: 100vh; /* Adjust as needed */
}
</style>
