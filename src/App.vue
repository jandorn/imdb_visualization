<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import Header from './components/Header.vue'
import { useNavigationStore } from './stores/navigationStore'
import { useMovieStore } from './stores/movieStore'
import { useTop100MoviesStore } from './stores/top100MoviesStore'
import * as d3 from 'd3';

import Intro1 from './components/pages/intro/Intro1.vue'
import Intro2 from './components/pages/intro/Intro2.vue'
import Intro3 from './components/pages/intro/Intro3.vue'
import Genre1 from './components/pages/placeholder/Genre1.vue'
import Genre2 from './components/pages/placeholder/Genre2.vue'
import Genre3 from './components/pages/placeholder/Genre3.vue'
import Genre4 from './components/pages/placeholder/Genre4.vue'
import Genre5 from './components/pages/placeholder/Genre5.vue'
import Time1 from './components/pages/placeholder/Time1.vue';
import Time2 from './components/pages/placeholder/Time2.vue';
import Time22 from './components/pages/placeholder/Time22.vue';
import Time3 from './components/pages/placeholder/Time3.vue';
import Time4 from './components/pages/placeholder/Time4.vue';
import Time5 from './components/pages/placeholder/Time5.vue';
import Time6 from './components/pages/placeholder/Time6.vue';
import Time7 from './components/pages/placeholder/Time7.vue';

const navigationStore = useNavigationStore()
const movieStore = useMovieStore()
const top100MoviesStore = useTop100MoviesStore()

const pages = {
  "Intro": [Intro1, Intro2, 'Page 3', 'Page 4'],
  "Genre": [
    Genre1,
    Genre2,
    Genre3,
    Genre4,
    Genre5
  ],
  "Time": [
    Time1,
    Time2,
    Time22,
    Time3,
    Time4,
    Time5,
    Time6,
    Time7
  ]
};

const chapters = Object.keys(pages);
const currentChapterIndex = ref(0);
const currentPageIndex = ref(0);
const isAnimating = ref(false);

const currentChapter = computed(() => chapters[currentChapterIndex.value]);
const currentPage = computed(() => pages[currentChapter.value][currentPageIndex.value]);

const updateNavigationStore = () => {
  navigationStore.setCurrentChapterIndex(currentChapterIndex.value);
  navigationStore.setCurrentPageIndex(currentPageIndex.value);
  navigationStore.setCurrentPage(
    typeof currentPage.value === 'object' 
      ? currentPage.value.__name 
      : currentPage.value
  );
};

const totalPages = computed(() => Object.values(pages).reduce((sum, chapter) => sum + chapter.length, 0));

const currentPageNumber = computed(() => {
  let pageNumber = 1;
  for (let i = 0; i < currentChapterIndex.value; i++) {
    pageNumber += pages[chapters[i]].length;
  }
  return pageNumber + currentPageIndex.value;
});

const changePage = (direction) => {
  d3.selectAll('.tooltip').remove();
  
  let newChapterIndex = currentChapterIndex.value;
  let newPageIndex = currentPageIndex.value + direction;
  
  if (newPageIndex < 0) {
    if (newChapterIndex > 0) {
      newChapterIndex--;
      newPageIndex = pages[chapters[newChapterIndex]].length - 1;
    } else {
      return;
    }
  } else if (newPageIndex >= pages[chapters[newChapterIndex]].length) {
    if (newChapterIndex < chapters.length - 1) {
      newChapterIndex++;
      newPageIndex = 0;
    } else {
      return;
    }
  }
  
  currentChapterIndex.value = newChapterIndex;
  currentPageIndex.value = newPageIndex;
  
  updateNavigationStore();
  
  isAnimating.value = true;
  requestAnimationFrame(() => {
    isAnimating.value = false;
  });
};

const handleClick = (event) => {
  const { clientX, target } = event;
  const { left, width } = target.getBoundingClientRect();
  const relativeX = clientX - left;
  const threshold = width * 0.25;

  if (relativeX < threshold) {
    changePage(-1);
  } else {
    changePage(1);
  }
};

onMounted(() => {
  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') changePage(1);
    if (e.key === 'ArrowLeft') changePage(-1);
  });
});

const showClickToContinue = ref(true);
const isClickToContinueVisible = ref(true);

watch([currentChapterIndex, currentPageIndex], ([newChapterIndex, newPageIndex]) => {
  if (newChapterIndex === 0 && newPageIndex === 0) {
    showClickToContinue.value = true;
    isClickToContinueVisible.value = true;
  } else {
    showClickToContinue.value = false;
    setTimeout(() => {
      isClickToContinueVisible.value = false;
    }, 200);
  }
});

const isLoading = ref(true)
const showApp = ref(false)
const isAnimationDone = ref(false)

onMounted(async () => {
  if (movieStore.movies.length === 0) {
    await movieStore.fetchMovies()
  }
  isLoading.value = false
  setTimeout(() => {
    showApp.value = true
    setTimeout(() => {
      isAnimationDone.value = true
    }, 1000)
  }, 400)
})
</script>

<template>
  <div class="relative overflow-hidden">
    <!-- loading screen -->
    <div 
      class="fixed inset-0 bg-[#EABB0F] flex items-center justify-center z-50 transition-transform duration-1000"
      :class="{ 'translate-y-full': !isLoading && showApp, 'hidden': !isLoading && showApp && isAnimationDone }"
    >
      <div class="font-semibold text-white flex flex-col justify-center items-center">
        <div>Loading</div>
        <div>{{ movieStore.loadingProgress }}%</div>
      </div>
    </div>

    <!-- actual app -->
    <div class="min-h-screen mx-2 sm:mx-12 select-none" @click="handleClick">
      <Header 
        :pages="pages" 
        :currentChapterIndex="currentChapterIndex" 
        :currentPageIndex="currentPageIndex"
      />
      <main 
        class="flex flex-col items-center justify-center"
      >
        <component :is="currentPage" v-if="typeof currentPage === 'object'" />
        <div class="text-sm font-bold mt-32" v-else>
          {{ currentPage }}
        </div>
        <!-- page number on bottom right (every page except first page) -->
        <div 
          v-if="!showClickToContinue"
          class="text-sm opacity-40 fixed bottom-1 right-3 transition ease-out"
          :class="{ 'scale-110': isAnimating }"
        >
          {{ currentPageNumber }} / {{ totalPages }}
        </div>
        <!-- click to continue banner on first page -->
        <div 
          v-show="isClickToContinueVisible"
          class="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 w-64 transition-all duration-300 ease-in-out px-8 py-4 rounded-lg"
          :class="{ 'opacity-0 translate-y-4': !showClickToContinue }"
        >
          <div class="absolute inset-0 bg-[#FBF9F5]/95 rounded-lg border"></div>
          <img src="./assets/click_to_continue.svg" alt="Click to continue" class="w-full relative z-10">
        </div>
      </main>
    </div>
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Condensed:wght@400;700&display=swap');

body {
  font-family: 'IBM Plex Sans Condensed', sans-serif;
  background-color: #FBF9F5;
}
</style>
