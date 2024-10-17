<script setup>
import { onMounted, ref, onUnmounted } from 'vue';
import PageLayout from '../../layout/PageLayout.vue';
import * as d3 from 'd3';

const chartRef = ref(null);
const chartWidth = ref(0);
const chartHeight = ref(600);

let nodes = [];
let links = [];
let data = [];

let resizeObserver;

onMounted(() => {
  // create adjacency list
  computeAdjacencyList();
  updateChartSize();
  
  resizeObserver = new ResizeObserver(() => {
    updateChartSize();
    renderForceSimulation();
  });
  
  if (chartRef.value) {
    resizeObserver.observe(chartRef.value);
  }
});

onMounted(() => {
  d3.tsv('src/assets/data/AllMovies.csv').then(loadedData => {
    console.log('Loaded Data:', loadedData);
    data = loadedData.map(d => ({
      title: d.primaryTitle,  // Access 'primaryTitle' column for movie title
      genres: d.genres        // Access 'genres' column
    }));
    
    computeAdjacencyList();
    updateChartSize();
    
    resizeObserver = new ResizeObserver(() => {
      updateChartSize();
      renderForceSimulation();
    });
  
    if (chartRef.value) {
      resizeObserver.observe(chartRef.value);
    }
  });
});

// Function to compute the adjacency list (nodes and links) dynamically
function computeAdjacencyList() {
  const genreOccurrences = {};
  const genrePairs = {};
  // Step 1: Split the genres and count occurrences of each genre
  data.forEach(movie => {
    // Check if 'genres' exists and is a non-empty string
    if (movie.genres && movie.genres.trim() !== "") {
      const genres = movie.genres.split(',');  // Assuming genres are comma-separated in the CSV/TSV
      genres.forEach(genre => {
        genreOccurrences[genre] = (genreOccurrences[genre] || 0) + 1;
      });

      // Step 2: Create genre pairs and count co-occurrences for the Jaccard index
      for (let i = 0; i < genres.length; i++) {
        for (let j = i + 1; j < genres.length; j++) {
          const pairKey = [genres[i], genres[j]].sort().join('-');
          genrePairs[pairKey] = (genrePairs[pairKey] || { count: 0, genres: [genres[i], genres[j]] });
          genrePairs[pairKey].count += 1;
        }
      }
    }
  });

  // Step 3: Prepare the nodes (unique genres)
  nodes = Object.keys(genreOccurrences).map(genre => ({
    id: genre,
    count: genreOccurrences[genre]
  }));

  // Step 4: Prepare the links (edges) with Jaccard index as weight
  links = Object.values(genrePairs).map(pair => {
    const [genre1, genre2] = pair.genres;
    const intersectionCount = pair.count;
    const unionCount = genreOccurrences[genre1] + genreOccurrences[genre2] - intersectionCount;
    const jaccardIndex = intersectionCount / unionCount;

    return { source: genre1, target: genre2, weight: jaccardIndex };
  });

  //console.log(nodes, links);  // Debug: Check nodes and links computation
}

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

  const simulation = d3.forceSimulation(nodes)
    .force("link", d3.forceLink(links).id(d => d.id).distance(d => 0.1 / d.weight).strength(0.1))
    .force("charge", d3.forceManyBody().strength(0.1))
    .force("center", d3.forceCenter(chartWidth.value / 2, chartHeight.value / 2))
    .force('collision', d3.forceCollide().radius(d => Math.sqrt(d.count) ))  // node size based on genre count
    .alpha(0.2)  
    .alphaDecay(0.05); 

  const link = svg.append("g")
    .selectAll("line")
    .data(links)
    .join("line")
    .attr("stroke", "#999")
    .attr("stroke-opacity", 0.6)
    .attr('stroke-width', d => d.weight * 100);  // edge thickness based on Jaccard index

  const node = svg.append("g")
    .selectAll("circle")
    .data(nodes)
    .join("circle")
    .attr('r', d => Math.sqrt(d.count) * 0.3)  //node size scaled by genre count
    .attr("fill", d => d.id === 1 ? "#F5C519" : "#012F4D");

  node.append("title")
    .text(d => d.name);

  simulation.on("tick", () => {
    link
      .attr("x1", d => d.source.x)
      .attr("y1", d => d.source.y)
      .attr("x2", d => d.target.x)
      .attr("y2", d => d.target.y);

    node
      .attr("cx", d => d.x)
      .attr("cy", d => d.y);
  });

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
}
</script>

<template>
    <PageLayout>
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

    </PageLayout>
</template>
