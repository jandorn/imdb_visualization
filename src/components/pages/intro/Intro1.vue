<script setup>
import PageLayout from '../../layout/PageLayout.vue';
import LogoWhite from '../../../assets/logo/IMDb_white.png';
import PieChart from '../../charts/intro/PieChart.vue';
import Top100Table from '../../charts/intro/Top100Table.vue';
import WordCloud from '../../charts/intro/WordCloud.vue';
</script>

<template>
    <PageLayout>
      <div class="max-h-screen">
        <div class="text-center text-5xl font-bold mt-8 text-gray-600 z-10">
          Uncover the Story Behind the Stars
        </div>
        <div class="text-center md:w-[500px] mx-auto text-xl mt-4 text-gray-600 z-10">
          Discover trends, insights, and the hidden dynamics of your favorite movies and shows.*
        </div>
        <div class="flex justify-center gap-8 h-full">
          <div class="flex flex-col">
            <PieChart />
            <div class="text-center font-bold -mt-6 text-gray-600 z-10">
              IMDb Data categories
            </div>
          </div>
          <div class="mt-16">
            <div class="text-center font-bold text-gray-600 z-10 mb-4">
              Top 100 Movies
            </div>
            <Top100Table />
          </div>
          <div class="flex flex-col">
            <WordCloud />
            <div class="text-center font-bold text-gray-600 z-10">
              IMDb Genres
            </div>
          </div>
        </div>
        <div class="absolute bottom-0 mx-auto left-0 right-0 -z-10">
          <img :src="LogoWhite" alt="IMDb Logo" class="w-full h-auto max-w-full" />
        </div>
        <div class="absolute bottom-4 left-4 text-sm text-gray-600 z-10">
          * All data is sourced from a publicly available IMDb dataset.
        </div>
      </div>
    </PageLayout>
</template>
