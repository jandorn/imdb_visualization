<script setup>
import { onMounted, ref, onUnmounted, computed, watch } from 'vue';
import PageLayout from '../../layout/PageLayout.vue';
import * as d3 from 'd3';
import { useMovieStore } from '../../../stores/movieStore.js';

const movieStore = useMovieStore();

const chartRef = ref(null);
const chartWidth = ref(0);
const chartHeight = ref(600);
const mapMode = ref(false);


let nodes = ref([]);
let links = ref([]);
let resizeObserver;
let simulation;
let colorScale;
let tooltip;
let linkLookup = {};
let svg;
let matrixGroup;
let graphGroup;

function updateChartSize() {
  if (chartRef.value) {
    chartWidth.value = chartRef.value.clientWidth;
  }
}

const initializeScales = () => {
  const weights = links.value.map(d => d.weight);
  const minWeight = Math.min(...weights);
  const maxWeight = Math.max(...weights);

  colorScale = d3.scaleSequential()
    .domain([minWeight, maxWeight])
    .interpolator(d3.interpolateYlOrBr);

  if (!tooltip) {
    tooltip = d3.select("body")
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
  }
};

const computeAdjacencyList = () => {
  const genreOccurrences = {};
  const genrePairs = {};
  linkLookup = {};
  
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

    const link = {
      source: genre1,
      target: genre2,
      weight: jaccardIndex,
      commonMovies: intersectionCount
    };

    const key = [genre1, genre2].sort().join('-');
    linkLookup[key] = link;

    return link;
  });
};

function renderForceSimulation() {
  initializeScales();

  d3.select(chartRef.value).selectAll("svg").remove();

  svg = d3.select(chartRef.value)
    .append('svg')
    .attr('width', chartWidth.value)
    .attr('height', chartHeight.value);

  graphGroup = svg.append('g')
    .attr('class', 'graph-group')
    .attr('transform', `translate(${chartWidth.value / 2}, ${chartHeight.value / 2}) scale(${0.85})`);

  simulation = d3.forceSimulation(nodes.value)
    .force("link", d3.forceLink(links.value)
      .id(d => d.id)
      .distance(d => 300 * (1 - d.weight)))
    .force("charge", d3.forceManyBody().strength(-200)) 
    .force("center", d3.forceCenter(0, 0))
    .force("collision", d3.forceCollide().radius(d => Math.sqrt(d.count) * 0.3 + 5))
    .alpha(0.2)
    .alphaDecay(0.05); 

  const weights = links.value.map(d => d.weight);
  const minWeight = Math.min(...weights);
  const maxWeight = Math.max(...weights);

  const scaleOpacity = (value) => {
    if (minWeight === maxWeight) return 1; 
    return (value - minWeight) / (maxWeight - minWeight);
  };

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
    .join("circle")
    .attr('r', d => Math.sqrt(d.count) * 0.3)
    .attr("fill", "#F5C519")
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

    const labels = graphGroup.append("g")
      .selectAll("text")
      .data(nodes.value)
      .join("text")
      .attr('class', 'node-label')
      .text(d => d.id)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "central")
      .attr("font-size", "16px")
      .attr("fill", "black")
      .style("text-shadow", "-2px -2px 4px white, -2px 2px 4px white, 2px -2px 4px white, 2px 2px 4px white")
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

  simulation.on("tick", () => {
    link
      .attr("x1", d => d.source.x)
      .attr("y1", d => d.source.y)
      .attr("x2", d => d.target.x)
      .attr("y2", d => d.target.y);

    node
      .attr('cx', d => d.x)
      .attr('cy', d => d.y);

    labels
      .attr('x', d => d.x)
      .attr('y', d => d.y);
  });

}

const renderMatrix = () => {
  if (matrixGroup) matrixGroup.remove();

  matrixGroup = svg.append('g')
    .attr('class', 'matrix-group');

  const matrixSize = nodes.value.length;
  const margin = 22;
  const cellSize = Math.min(chartWidth.value - margin * 2, chartHeight.value - margin * 2) / (matrixSize + 3);
  const xOffset = chartWidth.value / 2 - ((matrixSize + 0.5) * cellSize) / 2;
  const yOffset = chartHeight.value / 2 - ((matrixSize + 0.5) * cellSize) / 2;

  // Matrix-Zellen erstellen
  const cellsData = nodes.value.flatMap((source, i) => 
    nodes.value.map((target, j) => {
      const key = [source.id, target.id].sort().join('-');
      const link = linkLookup[key];

      let commonMovies, weight;

      if (source.id === target.id) {
        commonMovies = source.count;
        weight = source.count;
      } else {
        commonMovies = link ? link.commonMovies : 0;
        weight = link ? link.weight : 0;
      }

      return {
        source,
        target,
        x: margin + j * (cellSize + 1),
        y: margin + i * (cellSize + 1),
        commonMovies: link ? link.commonMovies : 0,
        weight: link ? link.weight : 0
      };
    })
  );

  matrixGroup.selectAll('.matrix-cell')
    .data(cellsData)
    .join('rect')
    .attr('class', 'matrix-cell')
    .attr('x', d => d.x + xOffset)
    .attr('y', d => d.y + yOffset)
    .attr('width', cellSize)
    .attr('height', cellSize)
    .attr('fill', d => d.weight ? colorScale(d.weight) : '#eee')
    .attr('opacity', 0)
    .on("mouseover", (event, d) => {
      tooltip
        .style("visibility", "visible")
        .html(`${d.source.id} - ${d.target.id}<br>Movie Count: ${d.commonMovies}`);
    })
    .on("mousemove", (event) => {
      tooltip
        .style("top", (event.pageY - 10) + "px")
        .style("left", (event.pageX + 10) + "px");
    })
    .on("mouseout", () => {
      tooltip.style("visibility", "hidden");
    })
    .transition()
    .duration(1000)
    .attr('opacity', 1);
};


const toggleMap = () => {
  mapMode.value = !mapMode.value;
  switchViz();
};

const switchViz = () => {
  const svg = d3.select(chartRef.value).select('svg');
  const graphGroup = svg.select('g');

  const matrixSize = nodes.value.length;
  const cellSize = Math.min(chartWidth.value, chartHeight.value) / (matrixSize + 2);
  const margin = cellSize * 2;
  const xOffset = chartWidth.value / 2 - (matrixSize * cellSize) / 2;
  const yOffset = chartHeight.value / 2 - ((matrixSize + 4) * cellSize) / 2;

  if (mapMode.value) {
    if (simulation) simulation.stop();

    // Kanten ausblenden
    graphGroup.selectAll('line')
      .transition()
      .duration(1000)
      .attr('opacity', 0)
      .remove();

    let endTransitionCalled = false;
    // Kreise ausblenden
    graphGroup.selectAll('circle')
      .transition()
      .duration(1000)
      .attr('r', 0)
      .remove()
      .on('end', () => {
        if (!endTransitionCalled) {
          endTransitionCalled = true;
          // Labels zur linken Achse bewegen
          const rowLabels = graphGroup.selectAll('.node-label')
            .transition()
            .duration(1000)
            .attr('x', (d, i) => (margin - 50 + xOffset) - (chartWidth.value / 2))
            .attr('y', (d, i) => (margin + i * (cellSize+2.2) + cellSize / 2 + yOffset + 8) - (chartHeight.value / 2))
            .attr('text-anchor', 'end')
            .attr('alignment-baseline', 'middle')
            .attr('font-size', '12px');
  
          const columnLabels = graphGroup.selectAll('.node-label')
            .clone(true)
            .attr('class', 'column-label')
            .attr('x', d => d.x)
            .attr('y', d => d.y)
            .transition()
            .duration(1000)
            .attr('x', (d, i) => (margin + i * (cellSize+2.2) + xOffset + cellSize / 2) - (chartWidth.value / 2))
            .attr('y', (margin - 5 + yOffset - 40) - (chartHeight.value / 2))
            .attr('transform', (d, i) => {
              const x = (margin + i * (cellSize+2.2) + xOffset + cellSize / 2) - (chartWidth.value / 2);
              const y = (margin - 5 + yOffset) - (chartHeight.value / 2);
              return `rotate(-90, ${x}, ${y})`;
            })
            .attr('text-anchor', 'start')
            .attr('alignment-baseline', 'hanging')
            .attr('font-size', '12px');
        }
      });

    // Matrix nach den Transitionen rendern
    setTimeout(() => {
      renderMatrix();
    }, 1000);

  } else {
    // Matrix und Labels ausblenden
    if (matrixGroup) {
      matrixGroup.remove();
    }
    graphGroup.selectAll('.column-label').remove();

    // Force Layout neu rendern
    setTimeout(() => {
      renderForceSimulation();
    });
  }
};


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

watch(() => movieStore.movies, (newMovies) => {
  if (newMovies.length > 0) {
    computeAdjacencyList();
    updateChartSize();
    renderForceSimulation();
  }
}, { immediate: true });

</script>

<template>
  <PageLayout>
    <div class="w-full justify-start text-lg mb-4">
      Each movie has one or multiple genres associated with it. With this visualization, we can see how these genres are <b>related</b> to each other.
      The size of the circle represents the number of movies that have this genre.
      The thickness and color of the line represents the similarity between two genres depending on the number of movies they have in common.
      <br>
      Hover over a genre to see how many movies have it or change to the matrix view.
    </div>
    <div v-if="movieStore.isLoading">Loading...</div>
    <div v-else-if="movieStore.error">Error: {{ movieStore.error }}</div>
    <div v-else>
      <div class="flex flex-col items-center w-full">
        <button 
          @click.stop="toggleMap" 
          class="mb-2 px-2 py-1 text-xs bg-[#EABB0F] text-white rounded hover:bg-[#EABB0F]/80"
        >
          {{ mapMode ? 'Show Force Layout' : 'Show Matrix' }}
        </button>
        <div ref="chartRef" class="w-full h-[600px]"></div>
      </div>
    </div>
  </PageLayout>
</template>