<script setup>
import { ref, onMounted, computed } from 'vue';
import Header from './components/Header.vue'

const pages = {
  "Intro": ['Seite 1', 'Seite 2', 'Seite 3', 'Seite 4'],
  "Placeholder": [
    'Seite 5',
    'Seite 6',
    'Seite 7',
    'Seite 8',
    'Seite 9',
    'Seite 10',
    'Seite 11',
    'Seite 12',
    'Seite 13',
    'Seite 14',
    'Seite 15',
    'Seite 16',
    'Seite 17',
    'Seite 18',
    'Seite 19',
    'Seite 20',
    'Seite 21',
    'Seite 22',
    'Seite 23',
    'Seite 24',
  ],
  "Placeholder2": ['Seite 25', 'Seite 26', 'Seite 27']
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

onMounted(() => {
  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') changePage(1);
    if (e.key === 'ArrowLeft') changePage(-1);
  });
});
</script>

<template>
  <Header 
    :pages="pages" 
    :currentChapterIndex="currentChapterIndex" 
    :currentPageIndex="currentPageIndex"
  />
  <main class="flex flex-col items-center justify-center">
    <div class="text-4xl font-bold mb-4">
      {{ currentPage }}
    </div>
    <div 
      class="text-6xl font-bold transition ease-out"
      :class="{ 'scale-110': isAnimating }"
    >
      {{ currentPageNumber }} / {{ totalPages }}
    </div>
  </main>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Condensed:wght@400;700&display=swap');

body {
  font-family: 'IBM Plex Sans Condensed', sans-serif;
  background-color: #FBF9F5;
}

/* Hier können Sie zusätzliche Stile hinzufügen, wenn nötig */
</style>
