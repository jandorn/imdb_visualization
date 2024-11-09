<script setup>
import PageLayout from '../../layout/PageLayout.vue';
import GenreChart1 from '../../charts/GenreChart1.vue';
</script>

<template>
  <PageLayout>
    <div class="w-full justify-start text-lg">
      <div>
        The average rating of movies per genre.
      </div>
    </div>
    <div class="mt-8 relative">
        <GenreChart1 />
    </div>
</PageLayout>
</template>