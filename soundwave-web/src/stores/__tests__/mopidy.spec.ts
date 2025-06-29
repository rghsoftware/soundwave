import { describe, beforeEach, it, expect } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useMopidyStore, type MopidyState } from '../mopidy'
import { PlaybackState, type Track } from '@/types'

describe('Mopidy Store', () => {
  beforeEach(() => {
    // Creates a fresh Pinia instance and makes it active
    setActivePinia(createPinia())
  })

  it('initializes with the correct default state', () => {
    const store = useMopidyStore()
    const expectedState: MopidyState = {
      isConnected: false,
      error: null,
      playbackState: PlaybackState.STOPPED,
      currentTrack: null,
      tracklist: [],
      volume: 0,
      isMuted: false,
      trackPosition: 0,
    }
    expect(store.$state).toEqual(expectedState)
  })

  it('action setConnected updates connection status', () => {
    const store = useMopidyStore()
    store.setConnected(true)
    expect(store.isConnected).toBe(true)

    store.setConnected(false)
    expect(store.isConnected).toBe(false)
    expect(store.playbackState).toBe('stopped') // Also tests reset logic
  })

  it('action setCurrentTrack updates the current track and resets position', () => {
    const store = useMopidyStore()
    store.trackPosition = 5000
    const newTrack = { name: 'Test Track', uri: 'test:uri' }
    store.setCurrentTrack(newTrack as Track)
    expect(store.currentTrack).toEqual(newTrack)
    expect(store.trackPosition).toBe(0)
  })

  it('getter formattedTime correctly formats milliseconds to MM:SS', () => {
    const store = useMopidyStore()
    expect(store.formattedTime(65000)).toBe('01:05')
    expect(store.formattedTime(125000)).toBe('02:05')
    expect(store.formattedTime(0)).toBe('00:00')
    expect(store.formattedTime(undefined)).toBe('--:--')
  })

  it('getter formattedTrackPosition uses formattedTime', () => {
    const store = useMopidyStore()
    store.trackPosition = 90000
    expect(store.formattedTrackPosition).toBe('01:30')
  })

  it('getter formattedTrackLength uses formattedTime', () => {
    const store = useMopidyStore()
    store.currentTrack = { name: 'Test', uri: 'test:uri', length: 180000 } as Track
    expect(store.formattedTrackLength).toBe('03:00')
  })
})
