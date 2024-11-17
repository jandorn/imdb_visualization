<script setup>
import PageLayout from '../../layout/PageLayout.vue';
import GenreChart1 from '../../charts/GenreChart1.vue';
</script>

<template>
  <PageLayout>
    <div class="w-full justify-start text-lg">
      <div>
        <br>
        Only the genres Reality-TV, Talk-Show and Game-Show don't follow the same normal distribution which is because of their low amount of movies.
      </div>
    </div>
    <div class="mt-8 relative">
        <GenreChart1 />
    </div>
</PageLayout>
</template>