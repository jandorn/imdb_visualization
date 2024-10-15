<script setup>
import { onMounted, ref, onUnmounted } from 'vue';
import PageLayout from '../../layout/PageLayout.vue';
import * as d3 from 'd3';

const chartRef = ref(null);
const chartWidth = ref(0);
const chartHeight = ref(600);

const nodes = [
  { id: 1, name: "Hauptknoten" },
  { id: 2, name: "Unterknoten 1" },
  { id: 3, name: "Unterknoten 2" },
  { id: 4, name: "Unterknoten 3" },
  { id: 5, name: "Unterknoten 4" },
  { id: 6, name: "Blatt 1" },
  { id: 7, name: "Blatt 2" },
  { id: 8, name: "Blatt 3" },
  { id: 9, name: "Blatt 4" },
  { id: 10, name: "Blatt 5" },
];

const links = [
  { source: 1, target: 2 },
  { source: 1, target: 3 },
  { source: 1, target: 4 },
  { source: 1, target: 5 },
  { source: 2, target: 6 },
  { source: 2, target: 7 },
  { source: 3, target: 8 },
  { source: 4, target: 9 },
  { source: 5, target: 10 },
  { source: 3, target: 4 },
  { source: 2, target: 5 },
];

let resizeObserver;

onMounted(() => {
  updateChartSize();
  
  resizeObserver = new ResizeObserver(() => {
    updateChartSize();
    renderForceSimulation();
  });
  
  if (chartRef.value) {
    resizeObserver.observe(chartRef.value);
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

  const simulation = d3.forceSimulation(nodes)
    .force("link", d3.forceLink(links).id(d => d.id).distance(100))
    .force("charge", d3.forceManyBody().strength(-200))
    .force("center", d3.forceCenter(chartWidth.value / 2, chartHeight.value / 2))
    .force("collision", d3.forceCollide().radius(30));

  const link = svg.append("g")
    .selectAll("line")
    .data(links)
    .join("line")
    .attr("stroke", "#999")
    .attr("stroke-opacity", 0.6)
    .attr("stroke-width", 2);

  const node = svg.append("g")
    .selectAll("circle")
    .data(nodes)
    .join("circle")
    .attr("r", 10)
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
      if (distance < 100) {
        return d.x - dx * 10 / distance;
      }
      return d.x;
    }).strength(0.3));
    simulation.force("mouse-y", d3.forceY().y(d => {
      const dx = x - d.x;
      const dy = y - d.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < 200) {
        return d.y - dy * 30 / distance;
      }
      return d.y;
    }).strength(0.3));
    simulation.alpha(0.5).restart();
  });

  svg.on("mouseleave", () => {
    simulation.force("mouse", null);
    simulation.force("mouse-y", null);
    simulation.alpha(0.5).restart();
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

        Incididunt occaecat ut mollit adipisicing Lorem enim aliquip aute nulla culpa ut occaecat Lorem velit.
        Eu officia sit labore do dolore minim consequat anim.
        Amet Lorem qui veniam velit occaecat cillum reprehenderit sunt irure mollit sunt nostrud est veniam.
        Do pariatur ullamco reprehenderit sint cupidatat minim aute magna qui quis velit consectetur.
        Eiusmod voluptate cillum do Lorem excepteur irure dolore.
        Nulla laborum elit ex adipisicing eu laborum minim excepteur sunt qui voluptate officia aliquip.
        Velit cupidatat Lorem do adipisicing ut labore id.<br><br>

        Non sint consequat magna occaecat ullamco excepteur velit proident nulla voluptate non minim.
        Dolor magna occaecat fugiat magna pariatur aute consequat occaecat cillum est sint aliquip officia.
        Aliqua commodo pariatur minim nisi commodo nulla dolor ex dolor.
        Ipsum incididunt enim irure ullamco.
        Adipisicing eu ullamco et ea commodo aliqua labore consectetur voluptate pariatur ex duis reprehenderit dolore.
        Ad tempor pariatur fugiat culpa consequat aute excepteur ex. 
        Qui irure enim quis ad incididunt aliqua esse mollit.<br><br>

        Aliquip laborum non magna nostrud nisi.
        Nostrud do eu ullamco esse officia sit irure et quis duis ut culpa tempor.
        Dolor consectetur exercitation consectetur consectetur velit.
        Fugiat labore et minim dolor labore eiusmod nostrud velit aliqua.
        In pariatur reprehenderit sunt anim nulla.
        Culpa sunt tempor qui sit elit quis aute.
    </PageLayout>
</template>
