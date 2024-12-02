<script setup>
import { useTop100MoviesStore } from '../../../stores/top100MoviesStore';

const top100Store = useTop100MoviesStore();
</script>

<template>
    <div class="w-96 h-[400px] overflow-y-auto">
        <table>
          <thead>
            <tr>
              <th class="px-4 py-2 border-b-2 border-gray-300">Rank</th>
              <th class="px-4 py-2 border-b-2 border-gray-300">Title</th>
              <th class="px-4 py-2 border-b-2 border-gray-300">Votes</th>
              <th class="px-4 py-2 border-b-2 border-gray-300">Rating</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="rank in 100" :key="rank" class="hover:bg-gray-100 text-sm text-gray-600">
              <td class="px-4 py-2 border-b border-gray-300">{{ rank }}</td>
              <td class="px-4 py-2 border-b border-gray-300 font-bold">{{ top100Store.top100[rank]?.title }}</td>
              <td class="px-4 py-2 border-b border-gray-300">{{ top100Store.top100[rank]?.numVotes?.toLocaleString() }}</td>
              <td class="px-4 py-2 border-b border-gray-300">{{ top100Store.top100[rank]?.averageRating?.toFixed(1) }}</td>
            </tr>
          </tbody>
        </table>
    </div>
</template>