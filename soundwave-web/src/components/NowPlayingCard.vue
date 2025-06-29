<template>
  <div class="bg-card p-6 text-center rounded-xl shadow-large">
    <h2 class="text-xs uppercase text-text-secondary font-bold tracking-wider">Now Playing</h2>
    <div class="mt-4">
      <img
        :src="
          track?.album?.images?.at(0)?.uri ??
          'https://placehold.co/128x128/555555/94a3b8?text=Music'
        "
        alt="Album Art"
        class="w-32 h-32 mx-auto rounded-lg shadow-md"
      />
      <h3 class="text-2xl font-bold mt-4 text-text-main">{{ track?.name ?? 'Nothing Playing' }}</h3>
      <p class="text-md text-text-secondary">{{ track?.artists?.join(', ') ?? '' }}</p>
    </div>
    <div class="mt-6">
      <div class="w-full bg-muted rounded-full h-2">
        <div class="bg-primary h-2 rounded-full" style="width: 45%"></div>
      </div>
      <div class="flex justify-between text-xs text-text-secondary mt-1">
        <span>1:35</span>
        <span>3:50</span>
      </div>
    </div>
    <div class="flex items-center justify-center space-x-6 mt-6">
      <button class="icon-btn text-2xl"><i class="fas fa-backward-step"></i></button>
      <button class="icon-btn text-5xl text-primary hover:text-primary-hover">
        <i class="fas fa-pause-circle"></i>
      </button>
      <button class="icon-btn text-2xl"><i class="fas fa-forward-step"></i></button>
    </div>
    <div class="flex items-center space-x-3 mt-8 max-w-xs mx-auto">
      <i class="fas fa-volume-down text-text-secondary"></i>
      <input
        type="range"
        class="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
        min="0"
        max="100"
        value="70"
      />
      <i class="fas fa-volume-up text-text-secondary"></i>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Track } from '@/types'

const props = defineProps<{
  track?: Track
}>()

const { track } = props
</script>

<style scoped></style>
