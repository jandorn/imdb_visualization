<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import Header from './components/Header.vue'

import Intro1 from './components/pages/intro/Intro1.vue'
import Intro2 from './components/pages/intro/Intro2.vue'

const pages = {
  "Intro": [Intro1, Intro2, 'Page 3', 'Page 4'],
  "Placeholder": [
    'Page 5',
    'Page 6',
    'Page 7',
    'Page 8',
    'Page 9',
    'Page 10',
    'Page 11',
    'Page 12',
    'Page 13',
    'Page 14',
    'Page 15',
    'Page 16',
    'Page 17',
    'Page 18',
    'Page 19',
    'Page 20',
    'Page 21',
    'Page 22',
    'Page 23',
    'Page 24',
  ],
  "Placeholder2": ['Page 25', 'Page 26', 'Page 27']
};

const chapters = Object.keys(pages);
const currentChapterIndex = ref(0);
const currentPageIndex = ref(0);
const isAnimating = ref(false);

const currentChapter = computed(() => chapters[currentChapterIndex.value]);
const currentPage = computed(() => pages[currentChapter.value][currentPageIndex.value]);

const totalPages = computed(() => Object.values(pages).reduce((sum, chapter) => sum + chapter.length, 0));

const currentPageNumber = computed(() => {
  let pageNumber = 1;
  for (let i = 0; i < currentChapterIndex.value; i++) {
    pageNumber += pages[chapters[i]].length;
  }
  return pageNumber + currentPageIndex.value;
});

const changePage = (direction) => {
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

import { useMovieStore } from './stores/movieStore'

const movieStore = useMovieStore()

onMounted(async () => {
  if (movieStore.movies.length === 0) {
    await movieStore.fetchMovies()
  }
})
</script>

<template>
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
      <!-- Page number on bottom right (every page except intro) -->
      <div 
        v-if="!showClickToContinue"
        class="text-sm opacity-40 fixed bottom-1 right-3 transition ease-out"
        :class="{ 'scale-110': isAnimating }"
      >
        {{ currentPageNumber }} / {{ totalPages }}
      </div>
      <!-- Click to continue banner on first -->
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
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Condensed:wght@400;700&display=swap');

body {
  font-family: 'IBM Plex Sans Condensed', sans-serif;
  background-color: #FBF9F5;
}
</style>
