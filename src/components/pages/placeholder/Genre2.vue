<script setup>
import PageLayout from '../../layout/PageLayout.vue';
import GenreChart1 from '../../charts/GenreChart1.vue';
</script>

<template>
  <PageLayout>
    <div class="w-full justify-start text-lg">
      <div>
        Every movie has one or more <b>genres</b> associated to it. <br>
        So let’s add a second dimension to the chart and plot the average rating of all movies over all genres.
      </div>
    </div>
    <div class="mt-8 relative">
        <GenreChart1 />
    </div>
</PageLayout>
</template>