<script setup>
import { computed } from 'vue';

const props = defineProps({
  pages: {
    type: Object,
    required: true
  },
  currentChapterIndex: {
    type: Number,
    required: true
  },
  currentPageIndex: {
    type: Number,
    required: true
  }
});

const chapters = computed(() => Object.keys(props.pages));
const chapterCounts = computed(() => chapters.value.map(chapter => props.pages[chapter].length));

const isCurrentPage = (chapterIndex, pageIndex) => {
  return props.currentChapterIndex === chapterIndex && props.currentPageIndex === pageIndex;
};

const isCurrentChapter = (chapterIndex) => {
  return props.currentChapterIndex === chapterIndex;
};

const getChapterWidth = (chapterIndex) => {
  return isCurrentChapter(chapterIndex) ? 'w-[80%]' : 'w-[10%]';
};

const getPageClass = (chapterIndex, pageIndex) => {
  const isActive = isCurrentPage(chapterIndex, pageIndex);
  return [
    'border rounded flex-1 transition-all duration-200',
    isActive ? 'border-[#F5C519] bg-[#F5C519] scale-y-[1.7]' : 'border-black opacity-25'
  ];
};
</script>

<template>
  <header class="my-4">
    <div class="flex justify-center">
      <img src="@/assets/imdb_visualized.svg" alt="IMDB Logo" class="h-10"/>
    </div>
    <div class="flex items-center my-6 space-x-4"> 
      <div v-for="(chapter, chapterIndex) in chapters" :key="chapter" 
           :class="[
             'flex flex-col space-y-1 font-semibold transition-all duration-100 ease-in-out',
             getChapterWidth(chapterIndex)
           ]">
        <div class="opacity-60 text-[10px] sm:text-xs text-nowrap">{{ chapterIndex + 1 }} – {{ chapter }}</div>
        <div class="chapters flex space-x-2 w-full">
          <template v-if="isCurrentChapter(chapterIndex)">
            <div v-for="pageIndex in chapterCounts[chapterIndex]" :key="pageIndex"
                 :class="getPageClass(chapterIndex, pageIndex - 1)">
            </div>
          </template>
          <template v-else>
            <div class="border rounded flex-1 border-black opacity-25 transition-all duration-300 ease-in-out"></div>
          </template>
        </div>
      </div>
    </div>
  </header>
</template>
