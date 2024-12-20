<script setup>
import PageLayout from '@/components/layout/PageLayout.vue';
import WorldMap1 from '@/components/charts/languages/WorldMap1.vue';
</script>

<template>
  <PageLayout>
    <div class="w-full justify-start text-lg">
      Watching a movie in its original language can offer a more authentic experience, however, in many cases, you might not be able to understand the language.<br>
    </div>
    <div class="h-[600px]">
      <WorldMap1 />
    </div>
  </PageLayout>
</template>

<style scoped>
</style>
