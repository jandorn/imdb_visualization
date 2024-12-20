<script setup>
import PageLayout from '@/components/layout/PageLayout.vue';
import WorldMap2 from '@/components/charts/languages/WorldMap2.vue';
</script>

<template>
  <PageLayout>
    <div class="w-full justify-start text-lg">
      Luckily, most movies are available in other languages.
      Taking the 1000 most popular movies, we can analyze and visualize the share of these movies available in different languages.
      For countries in gray, no movie data is available.
      <br>
    </div>
    <div class="h-[600px]">
      <WorldMap2 />
    </div>
  </PageLayout>
</template>

<style scoped>
</style>
