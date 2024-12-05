<script setup>
import PageLayout from '../../layout/PageLayout.vue';
import GenreChart1 from '../../charts/GenreChart1.vue';
import JokerImage from '../../../assets/images/joker.jpeg'
import MatrixImage from '../../../assets/images/matrix.jpeg'
</script>

<template>
  <PageLayout>
    <div class="w-full justify-start text-lg">
      Every movie has one or more <b>genres</b> associated to it.<br>
      So let's add a second dimension to the chart and plot the average rating of all movies of a certain genre.
    </div>
    <div class="mt-8 relative overflow-visible">
      <GenreChart1 />
      <div class="absolute text-lg left-28 top-4 w-[500px]">
        <img :src="MatrixImage" class="w-[80px] rounded-lg drop-shadow-[0_8px_8px_rgba(0,0,0,0.6)]" />
        <div class="absolute text-sm left-24 top-4">
          <div class="font-semibold text-2xl text-[#ea330f]">Action, Sci-Fi</div>
        </div>
      </div>
      <div class="absolute text-lg left-28 top-40 w-[500px]">
        <img :src="JokerImage" class="w-[80px] rounded-lg drop-shadow-[0_8px_8px_rgba(0,0,0,0.6)]" />
        <div class="absolute text-sm left-24 top-4">
          <div class="font-semibold text-2xl text-[#ea330f]">Drama, Crime, Musical</div>
        </div>
      </div>

      <div class="absolute right-0 top-8 text-lg w-[500px]">
        
      </div>
    </div>
  </PageLayout>
</template>