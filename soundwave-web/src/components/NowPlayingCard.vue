<template>
  <div class="bg-card p-6 text-center rounded-xl shadow-large">
    <h2 class="text-xs uppercase text-text-secondary font-bold tracking-wider">Now Playing</h2>
    <div class="mt-4">
      <img
        :src="
          mopidyStore?.albumArt ??
          `https://placehold.co/128x128/555555/94a3b8?text=${
            mopidyStore.currentTrack?.name ?? 'Play Something'
          }`
        "
        alt="Album Art"
        class="w-32 h-32 mx-auto rounded-lg shadow-md"
      />
      <h3 class="text-2xl font-bold mt-4 text-text-main">
        {{ mopidyStore.currentTrack?.name ?? 'Nothing Playing' }}
      </h3>
      <p class="text-md text-text-secondary">{{ mopidyStore.formattedArtist }}</p>
    </div>
    <div class="mt-6">
      <div class="w-full bg-muted rounded-full h-2">
        <div class="bg-primary h-2 rounded-full" :style="{ width: progessPercent + '%' }"></div>
      </div>
      <div class="flex justify-between text-xs text-text-secondary mt-1">
        <span>{{ mopidyStore.formattedTrackPosition }}</span>
        <span>{{ mopidyStore.formattedTrackLength }}</span>
      </div>
    </div>
    <div class="flex items-center justify-center space-x-6 mt-6">
      <button class="icon-btn text-2xl" @click="handleBackward">
        <i class="fas fa-backward-step"></i>
      </button>
      <button
        class="icon-btn text-5xl text-primary hover:text-primary-hover"
        @click="handlePlayPause"
      >
        <div v-if="isPlaying">
          <i class="fas fa-pause-circle"></i>
        </div>
        <div v-else>
          <i class="fas fa-play-circle"></i>
        </div>
      </button>
      <button class="icon-btn text-2xl" @click="handleForward">
        <i class="fas fa-forward-step"></i>
      </button>
    </div>
    <div class="flex items-center space-x-3 mt-8 max-w-xs mx-auto">
      <i class="fas fa-volume-down text-text-secondary"></i>
      <input
        type="range"
        class="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
        min="0"
        max="100"
        @input="handleVolumeChange"
      />
      <i class="fas fa-volume-up text-text-secondary"></i>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue'
import { useMopidyStore } from '@/stores/mopidy'
import { PlaybackState } from '@/types'
import type { MopidyService } from '@/services/mopidy'

const mopidyStore = useMopidyStore()
const mopidyService = inject<MopidyService>('mopidyService')

const progessPercent = computed(() => {
  if (!mopidyStore.currentTrack?.length || !mopidyStore.currentTrack?.length) return 0
  return (mopidyStore.trackPosition / mopidyStore.currentTrack.length) * 100
})

const isPlaying = computed(() => {
  return mopidyStore.playbackState === PlaybackState.PLAYING
})

const handleBackward = () => {
  mopidyService?.previous()
}

const handleForward = () => {
  mopidyService?.next()
}

const handlePlayPause = () => {
  mopidyService?.play()
}

const handleVolumeChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const volume = parseInt(target.value, 10)
  mopidyService?.setVolume(volume)
}
</script>

<style scoped></style>
