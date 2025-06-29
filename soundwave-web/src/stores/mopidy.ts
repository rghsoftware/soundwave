import { defineStore } from 'pinia'

import { PlaybackState } from '@/types'
import type { Track } from '@/types'

interface MopidyState {
  isConnected: boolean
  error: string | null
  playbackState: PlaybackState
  currentTrack: Track | null
  tracklist: Track[]
  volume: number
  isMuted: boolean
  trackPosition: number // Current position in the track in milliseconds
}

export const useMopidyStore = defineStore('mopidy', {
  state: (): MopidyState => ({
    isConnected: false,
    error: null,
    playbackState: PlaybackState.STOPPED,
    currentTrack: null,
    tracklist: [],
    volume: 0,
    isMuted: false,
    trackPosition: 0,
  }),

  getters: {
    formattedArtist(state): string {
      if (
        !state.currentTrack ||
        !state.currentTrack.artists ||
        state.currentTrack.artists.length === 0
      ) {
        return 'Unknown Artist'
      }

      return state.currentTrack.artists.map((artist) => artist.name).join(', ')
    },

    albumArt(state): string | null {
      const images = state.currentTrack?.album?.images
      return images && images.length > 0 ? images[0].url : null
    },

    // Reusable getter to format time from milliseconds to MM:SS
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    formattedTime(_state) {
      return (ms: number | undefined): string => {
        if (ms === undefined || isNaN(ms)) {
          return '--:--'
        }
        const totalSeconds = Math.floor(ms / 1000)
        const minutes = Math.floor(totalSeconds / 60)
          .toString()
          .padStart(2, '0')
        const seconds = (totalSeconds % 60).toString().padStart(2, '0')
        return `${minutes}:${seconds}`
      }
    },

    // Getter for the current track's position, formatted
    formattedTrackPosition(state): string {
      return this.formattedTime(state.trackPosition)
    },

    // Getter for the current track's total length, formatted
    formattedTrackLength(state): string {
      return this.formattedTime(state.currentTrack?.length)
    },
  },

  actions: {
    setConnected(status: boolean) {
      this.isConnected = status
      if (!status) {
        this.playbackState = PlaybackState.STOPPED
        this.currentTrack = null
      }
    },

    setError(message: string | null) {
      this.error = message
    },

    setPlaybackState(state: PlaybackState) {
      this.playbackState = state
    },

    setCurrentTrack(track: Track | null) {
      this.currentTrack = track
      this.trackPosition = 0 // Reset position when changing track
    },

    setTrackPosition(position: number) {
      this.trackPosition = position
    },

    setTracklist(tracks: Track[]) {
      this.tracklist = tracks
    },

    setVolume(volume: number) {
      this.volume = volume
    },

    setMute(muted: boolean) {
      this.isMuted = muted
    },
  },
})
