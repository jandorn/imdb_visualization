<script setup>
import { onMounted, ref, onUnmounted } from 'vue';
import PageLayout from '../../layout/PageLayout.vue';
import * as d3 from 'd3';
import LogoWhite from '../../../assets/logo/IMDb_white.png';
import PieChart from '../../charts/intro/PieChart.vue';
</script>

<template>
    <PageLayout>
        <div class="text-center text-5xl font-bold mt-8 text-gray-600 z-10">
          Uncover the Story Behind the Stars
        </div>
        <div class="text-center md:w-[500px] mx-auto text-xl mt-4 text-gray-600 z-10">
          Discover trends, insights, and the hidden dynamics of your favorite movies and shows.
        </div>
        <div class="flex flex-col w-min">
          <PieChart />
          <div class="text-center font-bold -mt-8 text-gray-600 z-10">
            IMDb Data categories
          </div>
        </div>
        <div class="absolute bottom-0 mx-auto left-0 right-0 -z-10">
          <img :src="LogoWhite" alt="IMDb Logo" class="w-full h-auto max-w-full" />
        </div>
    </PageLayout>
</template>
