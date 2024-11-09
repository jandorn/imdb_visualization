<script setup>
import PageLayout from '../../layout/PageLayout.vue';
import GenreChart1 from '../../charts/GenreChart1.vue';
import JokerImage from '../../../assets/images/joker.jpeg'
import MatrixImage from '../../../assets/images/matrix.jpeg'
</script>

<template>
  <PageLayout>
    <div class="w-full justify-start text-lg">
      <div class="mb-2">
        Now lets look at the <b>ratings</b> of movies.
      </div>
      <div>
        IMDb gives registered users the possibility to rate movies on a scale from 1-10.
      </div>
      <div>
        This data is interesting when selecting a movie for a movie night, but not so much in the grand scheme of things.
      </div>
    </div>
    <div class="mt-8 relative overflow-visible">
      <GenreChart1 />
      <div class="absolute text-lg left-28 top-4 w-[500px]">
        <img :src="MatrixImage" class="w-[80px] rounded-lg drop-shadow-[0_8px_8px_rgba(0,0,0,0.6)]" />
        <div class="absolute text-sm left-24 top-4">
          <div class="font-bold text-xs">IMDb RATING</div>
          <div class="text-xl"><span class="text-[#EABB0F]">★</span> 8.7/10</div>
          <div class="text-[10px] pl-[26px] font-semibold -mt-1">2.1M</div>
          <div class="mt-4">Genres: <span class="font-semibold text-[#ea330f]">Action, Sci-Fi</span></div>
        </div>
      </div>
      <div class="absolute text-lg left-28 top-40 w-[500px]">
        <img :src="JokerImage" class="w-[80px] rounded-lg drop-shadow-[0_8px_8px_rgba(0,0,0,0.6)]" />
        <div class="absolute text-sm left-24 top-4">
          <div class="font-bold text-xs">IMDb RATING</div>
          <div class="text-xl"><span class="text-[#EABB0F]">★</span> 5.3/10</div>
          <div class="text-[10px] pl-[26px] font-semibold -mt-1">66K</div>
          <div class="mt-4">Genres: <span class="font-semibold text-[#ea330f]">Drama, Crime, Musical</span></div>
        </div>
      </div>

      <div class="absolute right-0 top-8 text-lg w-[500px]">
        Every movie has one or more <b>genres</b> associated to it.
        So let’s add a second dimension to the chart and plot the average rating of all movies of a certain genre.
      </div>
    </div>
  </PageLayout>
</template>