<script setup>
import PageLayout from '@/components/layout/PageLayout.vue';
import WorldMap2 from '@/components/charts/languages/WorldMap2.vue';
</script>

<template>
  <PageLayout>
    <div class="w-full justify-start text-lg">
      Luckily, most movies are available in other languages. Let's explore the share of movies available in different languages.<br>
    </div>
    <div class="h-[600px]">
      <WorldMap2 />
    </div>
  </PageLayout>
</template>

<style scoped>
</style>
