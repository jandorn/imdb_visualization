<script setup>
import PageLayout from '../../layout/PageLayout.vue';
import GenreChart1 from '../../charts/GenreChart1.vue';
</script>

<template>
  <PageLayout>
    <div class="w-full justify-start text-lg">
      <div>
        Now let's get a better understanding of the distribution of ratings per genre.
        Every genres follows more or less the same normal distribution which leaves the median rating around its mean.
      </div>
    </div>
    <div class="mt-8 relative">
        <GenreChart1 />
    </div>
</PageLayout>
</template>