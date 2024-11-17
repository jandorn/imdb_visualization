<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import * as d3 from 'd3';
import { useNavigationStore } from '../../stores/navigationStore.js';
import { useCalcGenreAvgStore } from '../../stores/calcGenreAvgStore.js'

const navigationStore = useNavigationStore();
const chartRef = ref(null);
const chartWidth = ref(0);
const chartHeight = ref(400);

const updateChartSize = () => {
  if (chartRef.value) {
    chartWidth.value = chartRef.value.clientWidth || 600;
    chartHeight.value = chartRef.value.clientHeight || 400;
  }
};

const handleResize = () => {
  updateChartSize();
  createChart();
};

const createChart = () => {
  if (!chartRef.value) return;

  d3.select(chartRef.value).selectAll('svg').remove();

  const margin = { top: 20, right: 30, bottom: 80, left: 40 };
  const width = Math.min(chartWidth.value - margin.left - margin.right, 1200);
  const height = chartHeight.value - margin.top - margin.bottom;

  const svg = d3.select(chartRef.value)
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  const y = d3.scaleLinear()
    .domain([1, 10])
    .range([height, 0]);

  svg.append('g')
    .call(d3.axisLeft(y).tickPadding(10))
    .call(g => g.select('.domain').attr('stroke-width', 2))
    .call(g => g.selectAll('.tick line').attr('stroke-width', 2))
    .call(g => g.selectAll('text').attr('font-weight', '600'));

  if (navigationStore.currentPage === 'Genre1' || navigationStore.currentPage === 'Genre2') {
    createGenre1Chart(svg, width, height, y);
  } else if (navigationStore.currentPage === 'Genre3') {
    createGenre3Chart(svg, width, height, y);
  } else if (navigationStore.currentPage === 'Genre4' || navigationStore.currentPage === 'Genre5') {
    createDistributionChart(svg, width, height, y);
  } 
};

const createGenre1Chart = (svg, width, height, y) => {
  const arrowPoints = [
    { value: 8.7 },
    { value: 5.3 }
  ];

  svg.selectAll('.arrow')
    .data(arrowPoints)
    .enter()
    .append('line')
    .attr('class', 'arrow')
    .attr('x1', 50)
    .attr('y1', d => y(d.value))
    .attr('y2', d => y(d.value))
    .attr('stroke', 'black')
    .attr('stroke-width', 1.6)
    .attr('marker-end', 'url(#arrow)')
    .attr('x2', 8);

  svg.append('defs').append('marker')
    .attr('id', 'arrow')
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', 8)
    .attr('refY', 0)
    .attr('markerWidth', 6)
    .attr('markerHeight', 6)
    .attr('orient', 'auto')
    .append('path')
    .attr('d', 'M0,-5L10,0L0,5')
    .attr('fill', 'black');
};

const createGenre3Chart = (svg, width, height, y) => {
  const genreAvgStore = useCalcGenreAvgStore()
  
  const tooltip = d3.select('body')
    .append('div')
    .attr('class', 'chart-tooltip')
    .style('position', 'absolute')
    .style('visibility', 'hidden')
    .style('background-color', 'white')
    .style('border', '1px solid #ddd')
    .style('border-radius', '4px')
    .style('padding', '8px')
    .style('font-size', '12px')
    .style('box-shadow', '0 2px 4px rgba(0,0,0,0.1)')
    .style('pointer-events', 'none')

  const formatNumber = d3.format(',')
  const formatWithDots = (num) => formatNumber(num).replace(/,/g, '.')

  const data = Object.entries(genreAvgStore.genreAverages).map(([genre, stats]) => ({
    genre,
    value: stats.average,
    amount: stats.amount
  }))
  
  const genres = data.map(d => d.genre)
  
  const x = d3.scaleBand()
    .range([0, width])
    .domain(genres)
    .padding(0)

  const xAxis = svg.append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(0,${height-1})`)

  const xAxisGroup = xAxis.call(d3.axisBottom(x))

  xAxisGroup.call(g => g.select('.domain').attr('stroke-width', 2))
  xAxisGroup.call(g => g.selectAll('.tick line').attr('stroke-width', 2))
  xAxisGroup.call(g => g.selectAll('text').attr('font-weight', '600'))

  xAxisGroup.selectAll('text')
    .attr('transform', 'translate(-10,5)rotate(-45)')
    .style('text-anchor', 'end')

  const maxAmount = d3.max(data, d => d.amount)
  const rScale = d3.scaleSqrt()
    .domain([0, maxAmount])
    .range([3, 20])

  svg.selectAll('.point')
    .data(data)
    .enter()
    .append('circle')
    .attr('class', 'point')
    .attr('cx', d => x(d.genre) + x.bandwidth() / 2)
    .attr('cy', height)
    .attr('r', 0)
    .attr('fill', 'steelblue')
    .attr('opacity', 0.7)
    .on('mouseover', function(event, d) {
      d3.select(this)
        .transition()
        .duration(200)
        .attr('opacity', 1)
        .attr('stroke', '#333')
        .attr('stroke-width', 2)

      tooltip
        .style('visibility', 'visible')
        .html(`
          <strong>${d.genre}</strong><br/>
          Average: ${d.value.toFixed(2)}<br/>
          Amount: ${formatWithDots(d.amount)}
        `)
    })
    .on('mousemove', (event) => {
      tooltip
        .style('top', (event.pageY - 10) + 'px')
        .style('left', (event.pageX + 10) + 'px')
    })
    .on('mouseout', function() {
      d3.select(this)
        .transition()
        .duration(200)
        .attr('opacity', 0.7)
        .attr('stroke-width', 0)

      tooltip.style('visibility', 'hidden')
    })
    .transition()
    .duration(200)
    .delay((d, i) => i * 30 + 200)
    .attr('cy', d => y(d.value))
    .attr('r', d => rScale(d.amount))

  onUnmounted(() => {
    tooltip.remove()
  })
}

const createDistributionChart = (svg, width, height, y) => {
  const genreAvgStore = useCalcGenreAvgStore()
  
  // Zahlenformatierer für tausender Punkte
  const formatNumber = d3.format(',')
  const formatWithDots = (num) => formatNumber(num).replace(/,/g, '.')
  
  // Tooltip erstellen
  const tooltip = d3.select('body')
    .append('div')
    .attr('class', 'chart-tooltip')
    .style('position', 'absolute')
    .style('visibility', 'hidden')
    .style('background-color', 'white')
    .style('border', '1px solid #ddd')
    .style('border-radius', '4px')
    .style('padding', '8px')
    .style('font-size', '12px')
    .style('box-shadow', '0 2px 4px rgba(0,0,0,0.1)')
    .style('pointer-events', 'none')

  // Daten vorbereiten
  let data = Object.entries(genreAvgStore.genreAverages).map(([genre, stats]) => ({
    genre,
    values: stats.data
  }))

  // Für Genre5: Filtere spezifische Genres
  if (navigationStore.currentPage === 'Genre5') {
    const selectedGenres = ['Drama', 'Comedy', 'Documentary', 'Reality-TV', 'Talk-Show', 'Game-Show']
    data = data.filter(d => selectedGenres.includes(d.genre))
  }

  const maxAmount = d3.max(data, d => d.values.length)
  
  // x-axis
  const x = d3.scaleBand()
    .range([0, width])
    .domain(data.map(d => d.genre))
    .padding(0.2)

  const xAxis = svg.append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(x))

  xAxis.selectAll('text')
    .attr('transform', 'translate(-10,5)rotate(-45)')
    .style('text-anchor', 'end')
    .attr('font-weight', '600')

  xAxis.call(g => g.select('.domain').attr('stroke-width', 2))
  xAxis.call(g => g.selectAll('.tick line').attr('stroke-width', 2))

  // Skalierung für die Breite der Plots
  const widthScale = d3.scaleSqrt()
    .domain([0, maxAmount])
    .range([x.bandwidth() * 0.3, x.bandwidth()])

  // Bins Generator definieren
  const binGenerator = d3.bin()
    .domain([1, 10])
    .thresholds(d3.range(1, 10, 0.1).map(x => Number(x.toFixed(1))))
    .value(d => Number(d.toFixed(1)))

  // KDE Funktionen
  const kde = (kernel, thresholds, data) => {
    return thresholds.map(t => [t, d3.mean(data, d => kernel(t - d))])
  }

  const epanechnikov = (bandwidth) => {
    return x => Math.abs(x /= bandwidth) <= 1 ? 0.75 * (1 - x * x) / bandwidth : 0
  }

  data.forEach(d => {
    const violinGroup = svg.append('g')
      .attr('transform', `translate(${x(d.genre)},0)`)

    const bandwidth = 0.5
    const density = kde(epanechnikov(bandwidth), y.ticks(50), d.values)
    const maxDensity = d3.max(density, d => d[1])
    const median = d3.median(d.values)

    const plotWidth = widthScale(d.values.length)
    const xNum = d3.scaleLinear()
      .range([0, plotWidth / 2])
      .domain([0, maxDensity])

    if (navigationStore.currentPage === 'Genre4') {
      // Linker Violin Plot
      const leftArea = d3.area()
        .x0(d => x.bandwidth() / 2 - xNum(d[1]))
        .x1(x.bandwidth() / 2)
        .y(d => y(d[0]))
        .curve(d3.curveCatmullRom)

      violinGroup.append('path')
        .datum(density)
        .attr('class', 'violin left')
        .attr('d', leftArea)
        .style('fill', 'steelblue')
        .style('opacity', 0.6)
        .on('mouseover', function() {
          d3.select(this).style('fill', '#F5C519')
          tooltip
            .style('visibility', 'visible')
            .html(`
              <strong>${d.genre}</strong><br/>
              Median: ${median.toFixed(2)}<br/>
              Min: ${d3.min(d.values).toFixed(2)}<br/>
              Max: ${d3.max(d.values).toFixed(2)}<br/>
              Amount: ${formatWithDots(d.values.length)}
            `)
        })
        .on('mousemove', (event) => {
          tooltip
            .style('top', (event.pageY - 10) + 'px')
            .style('left', (event.pageX + 10) + 'px')
        })
        .on('mouseout', function() {
          d3.select(this).style('fill', 'steelblue')
          tooltip.style('visibility', 'hidden')
        })
    } else if (navigationStore.currentPage === 'Genre5') {
      // Histogramm
      const binData = binGenerator(d.values)
        .map(bin => ({
          x0: Number(bin.x0?.toFixed(1)),
          x1: Number(bin.x1?.toFixed(1)),
          length: bin.length,
          genre: d.genre
        }))
        .filter(bin => bin.x0 != null && bin.x1 != null)

      const maxCount = d3.max(binData, d => d.length)
      const xHistogram = d3.scaleLinear()
        .range([0, plotWidth / 2])
        .domain([0, maxCount])

      const binsGroup = violinGroup.append('g')
        .attr('class', 'bins')

      binsGroup.selectAll('.bar')
        .data(binData)
        .join('rect')
        .attr('class', 'bar')
        .attr('x', d => x.bandwidth() / 2 - xHistogram(d.length))
        .attr('y', d => y(d.x1))
        .attr('height', d => y(d.x0) - y(d.x1))
        .attr('width', d => xHistogram(d.length))
        .style('fill', 'steelblue')
        .style('opacity', 0.6)
        .style('stroke', 'white')
        .style('stroke-width', '.2px')

      binsGroup
        .on('mouseover', (event) => {
          if (event.target.classList.contains('bar')) {
            const bin = d3.select(event.target).datum()
            d3.select(event.target).style('fill', '#F5C519')
            tooltip
              .style('visibility', 'visible')
              .html(`
                <strong>${bin.genre}</strong><br/>
                Rating: ${bin.x0.toFixed(1)}<br/>
                Amount: ${formatWithDots(bin.length)}
              `)
          }
        })
        .on('mousemove', (event) => {
          tooltip
            .style('top', (event.pageY - 10) + 'px')
            .style('left', (event.pageX + 10) + 'px')
        })
        .on('mouseout', (event) => {
          if (event.target.classList.contains('bar')) {
            d3.select(event.target).style('fill', 'steelblue')
            tooltip.style('visibility', 'hidden')
          }
        })
    }

    // Rechter Violin Plot (für beide Seiten)
    const rightArea = d3.area()
      .x0(x.bandwidth() / 2)
      .x1(d => x.bandwidth() / 2 + xNum(d[1]))
      .y(d => y(d[0]))
      .curve(d3.curveCatmullRom)

    violinGroup.append('path')
      .datum(density)
      .attr('class', 'violin right')
      .attr('d', rightArea)
      .style('fill', 'steelblue')
      .style('opacity', 0.6)
      .on('mouseover', function() {
        d3.select(this).style('fill', '#F5C519')
        tooltip
          .style('visibility', 'visible')
          .html(`
            <strong>${d.genre}</strong><br/>
            Median: ${median.toFixed(2)}<br/>
            Min: ${d3.min(d.values).toFixed(2)}<br/>
            Max: ${d3.max(d.values).toFixed(2)}<br/>
            Amount: ${formatWithDots(d.values.length)}
          `)
      })
      .on('mousemove', (event) => {
        tooltip
          .style('top', (event.pageY - 10) + 'px')
          .style('left', (event.pageX + 10) + 'px')
      })
      .on('mouseout', function() {
        d3.select(this).style('fill', 'steelblue')
        tooltip.style('visibility', 'hidden')
      })

    // Median Line
    violinGroup.append('line')
      .attr('x1', x.bandwidth()/4)
      .attr('x2', x.bandwidth()*3/4)
      .attr('y1', y(median))
      .attr('y2', y(median))
      .style('stroke', '#1a4e8c')
      .style('stroke-width', 2)
  })

  // Aufräumen beim Unmount
  onUnmounted(() => {
    tooltip.remove()
  })
}

onMounted(() => {
  updateChartSize();
  createChart();
  window.addEventListener('resize', handleResize);
});

watch(() => navigationStore.currentPage, () => {
  createChart();
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});
</script>

<template>
  <div ref="chartRef" class="w-full h-[400px]"></div>
</template>
