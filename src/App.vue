<script setup>
import { ref, onMounted } from 'vue';

const pages = ['Seite 1', 'Seite 2', 'Seite 3', 'Seite 4']; // Beispiel-Seitentitel
const currentPageIndex = ref(0);
const pageNumber = ref(1);
const isAnimating = ref(false);

const changePage = (direction) => {
  if (isAnimating.value) return;
  
  isAnimating.value = true;
  const newIndex = (currentPageIndex.value + direction + pages.length) % pages.length;
  currentPageIndex.value = newIndex;
  pageNumber.value = newIndex + 1;
  
  setTimeout(() => {
    isAnimating.value = false;
  }, 300); // Animation dauert 300ms
};

onMounted(() => {
  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') changePage(1);
    if (e.key === 'ArrowLeft') changePage(-1);
  });
});
</script>

<template>
  <main class="min-h-screen flex flex-col items-center justify-center">
    <div class="text-4xl font-bold mb-4">
      {{ pages[currentPageIndex] }}
    </div>
    <div 
      class="text-6xl font-bold transition-all duration-300 ease-in-out"
      :class="{ 'scale-150 opacity-0': isAnimating }"
    >
      {{ pageNumber }}
    </div>
  </main>
</template>

<style scoped>
/* Hier können Sie zusätzliche Stile hinzufügen, wenn nötig */
</style>
