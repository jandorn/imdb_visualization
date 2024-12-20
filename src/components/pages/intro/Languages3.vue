<script setup>
import PageLayout from '@/components/layout/PageLayout.vue';
import WorldMap3 from '@/components/charts/languages/WorldMap3.vue';
</script>

<template>
  <PageLayout>
    <div class="w-full justify-start text-lg">
       Darker shades indicate more available movies while lighter shades indicate that only a few of the titles are translated to that countries primary language.<br>
    </div>
    <div class="h-[600px]">
      <WorldMap3 />
    </div>
  </PageLayout>
</template>

<style scoped>
</style>
