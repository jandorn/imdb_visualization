<script setup>
import { onMounted, ref, onUnmounted, computed, watch } from 'vue';
import PageLayout from '../../layout/PageLayout.vue';
// import { drag as d3Drag } from 'd3-drag';
import * as d3 from 'd3';
import { useMovieStore } from '../../../stores/movieStore.js';

const movieStore = useMovieStore();

const chartRef = ref(null);
const chartWidth = ref(0);
const chartHeight = ref(600);

/*
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
*/

let nodes = ref([]);
let links = ref([]);

let resizeObserver;

const computeAdjacencyList = () => {
  const genreOccurrences = {};
  const genrePairs = {};
  
  movieStore.movies.forEach(movie => {
    if (movie.genres && movie.genres.length > 0) {
      movie.genres.forEach(genre => {
        genreOccurrences[genre] = (genreOccurrences[genre] || 0) + 1;
      });

      for (let i = 0; i < movie.genres.length; i++) {
        for (let j = i + 1; j < movie.genres.length; j++) {
          const pairKey = [movie.genres[i], movie.genres[j]].sort().join('-');
          genrePairs[pairKey] = (genrePairs[pairKey] || { count: 0, genres: [movie.genres[i], movie.genres[j]] });
          genrePairs[pairKey].count += 1;
        }
      }
    }
  });

  nodes.value = Object.keys(genreOccurrences)
    .map(genre => ({
      id: genre,
      count: genreOccurrences[genre]
  }));

  links.value = Object.values(genrePairs).map(pair => {
    const [genre1, genre2] = pair.genres;
    const intersectionCount = pair.count;
    const unionCount = genreOccurrences[genre1] + genreOccurrences[genre2] - intersectionCount;
    const jaccardIndex = intersectionCount / unionCount;

    return { 
      source: genre1, 
      target: genre2, 
      weight: jaccardIndex,
      commonMovies: intersectionCount
    };
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

onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect();
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
    .force("link", d3.forceLink(links.value)
        .id(d => d.id)
        .distance(d => 300 * (1 - d.weight)))
    .force("charge", d3.forceManyBody().strength(-200)) 
    .force("center", d3.forceCenter(0, 0))
    .force("collision", d3.forceCollide().radius(d => Math.sqrt(d.count) * 0.3 + 5)) 
    .alpha(0.2)  
    .alphaDecay(0.05); 

  const graphGroup = svg.append('g')
    .attr('transform', `translate(${chartWidth.value / 2}, ${chartHeight.value / 2}) scale(${0.85})`);

  const weights = links.value.map(d => d.weight);
  const minWeight = Math.min(...weights);
  const maxWeight = Math.max(...weights);

  const scaleOpacity = (value) => {
    if (minWeight === maxWeight) return 1; 
    return (value - minWeight) / (maxWeight - minWeight);
  };

  const colorScale = d3.scaleSequential()
    .domain([minWeight, maxWeight])
    .interpolator(d3.interpolateYlOrBr);

  const tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("visibility", "hidden")
    .style("background-color", "white")
    .style("border", "1px solid #ddd")
    .style("border-radius", "4px")
    .style("padding", "8px")
    .style("font-size", "12px")
    .style("pointer-events", "none");

  const link = graphGroup.append("g")
    .selectAll("line")
    .data(links.value)
    .join("line")
    .attr("stroke", d => colorScale(d.weight))
    .attr("stroke-opacity", d => scaleOpacity(d.weight))
    .attr('stroke-width', d => d.weight * 100)
    .on("mouseover", (event, d) => {
      tooltip
        .style("visibility", "visible")
        .html(`Genre Pair: ${d.source.id} - ${d.target.id}<br>
               Movie Count: ${d.commonMovies}`);
    })
    .on("mousemove", (event) => {
      tooltip
        .style("top", (event.pageY - 10) + "px")
        .style("left", (event.pageX + 10) + "px");
    })
    .on("mouseout", () => {
      tooltip.style("visibility", "hidden");
    });

  const node = graphGroup.append("g")
    .selectAll("g")
    .data(nodes.value)
    .join("g")
    .on("mouseover", (event, d) => {
      tooltip
        .style("visibility", "visible")
        .html(`Genre: ${d.id}<br>Count Movies: ${d.count}`);
    })
    .on("mousemove", (event) => {
      tooltip
        .style("top", (event.pageY - 10) + "px")
        .style("left", (event.pageX + 10) + "px");
    })
    .on("mouseout", () => {
      tooltip.style("visibility", "hidden");
    });

  node.append("circle")
    .attr('r', d => Math.sqrt(d.count) * 0.3)
    .attr("fill", "#F5C519");

  node.append("text")
    .text(d => d.id)
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "central")
    .attr("font-size", "16px")
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

}

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