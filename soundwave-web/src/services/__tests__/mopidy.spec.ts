/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MopidyService } from '../mopidy'
import { PlaybackState } from '@/types'
import Mopidy from 'mopidy'

// Mock Mopidy
vi.mock('mopidy', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      on: vi.fn(),
      connect: vi.fn(),
      close: vi.fn(),
      playback: {
        play: vi.fn(),
        pause: vi.fn(),
        next: vi.fn(),
        previous: vi.fn(),
        getState: vi.fn(),
        getCurrentTrack: vi.fn(),
        getTimePosition: vi.fn(),
        seek: vi.fn(),
      },
      mixer: {
        getVolume: vi.fn(),
        getMute: vi.fn(),
        setVolume: vi.fn(),
      },
      tracklist: {
        getTlTracks: vi.fn(),
      },
    })),
  }
})

describe('MopidyService', () => {
  let mopidyService: MopidyService
  let mockStore: any
  let mockMopidy: any

  beforeEach(() => {
    vi.clearAllMocks()

    // Create mock store
    mockStore = {
      setConnected: vi.fn(),
      setError: vi.fn(),
      setPlaybackState: vi.fn(),
      setCurrentTrack: vi.fn(),
      setVolume: vi.fn(),
      setMute: vi.fn(),
      setTrackPosition: vi.fn(),
      setTracklist: vi.fn(),
    }

    // Create service
    mopidyService = new MopidyService(mockStore)

    // Get reference to mocked Mopidy instance
    mockMopidy = (Mopidy as any).mock.results[0].value
  })

  describe('initialization and setup', () => {
    it('should set up event listeners on Mopidy instance', () => {
      expect(mockMopidy.on).toHaveBeenCalledWith('state:online', expect.any(Function))
      expect(mockMopidy.on).toHaveBeenCalledWith('state:offline', expect.any(Function))
      expect(mockMopidy.on).toHaveBeenCalledWith('event:trackPlaybackStarted', expect.any(Function))
      expect(mockMopidy.on).toHaveBeenCalledWith('event:trackPlaybackEnded', expect.any(Function))
      expect(mockMopidy.on).toHaveBeenCalledWith('event:playbackStateChanged', expect.any(Function))
      expect(mockMopidy.on).toHaveBeenCalledWith('event:volumeChanged', expect.any(Function))
      expect(mockMopidy.on).toHaveBeenCalledWith('event:muteChanged', expect.any(Function))
      expect(mockMopidy.on).toHaveBeenCalledWith('event:tracklistChanged', expect.any(Function))
    })
  })

  describe('connection management', () => {
    it('should connect to Mopidy server', () => {
      mopidyService.connect()
      expect(mockMopidy.connect).toHaveBeenCalled()
    })

    it('should disconnect from Mopidy server', () => {
      mopidyService.disconnect()
      expect(mockMopidy.close).toHaveBeenCalled()
    })
  })

  describe('event handling', () => {
    it('should handle online state and update store', () => {
      const onlineCallback = mockMopidy.on.mock.calls.find((call) => call[0] === 'state:online')[1]
      onlineCallback()

      expect(mockStore.setConnected).toHaveBeenCalledWith(true)
      expect(mockStore.setError).toHaveBeenCalledWith(null)
      expect(mockStore.setPlaybackState).toHaveBeenCalledWith(PlaybackState.PAUSED)
      expect(mockStore.setVolume).toHaveBeenCalledWith(50)
    })

    it('should handle offline state and update store', () => {
      const offlineCallback = mockMopidy.on.mock.calls.find(
        (call) => call[0] === 'state:offline',
      )[1]
      offlineCallback()

      expect(mockStore.setConnected).toHaveBeenCalledWith(false)
      expect(mockStore.setError).toHaveBeenCalledWith('Connection lost. Is Mopidy server running?')
    })

    it('should handle track playback started event', () => {
      const mockTrack = { name: 'Test Track', uri: 'test:uri' }
      const trackStartCallback = mockMopidy.on.mock.calls.find(
        (call) => call[0] === 'event:trackPlaybackStarted',
      )[1]

      trackStartCallback({ tl_track: { track: mockTrack } })

      expect(mockStore.setCurrentTrack).toHaveBeenCalledWith(mockTrack)
      expect(mockStore.setPlaybackState).toHaveBeenCalledWith(PlaybackState.PLAYING)
    })

    it('should handle track playback ended event', () => {
      vi.spyOn(window, 'clearInterval').mockImplementation(vi.fn())

      const trackEndCallback = mockMopidy.on.mock.calls.find(
        (call) => call[0] === 'event:trackPlaybackEnded',
      )[1]
      trackEndCallback()

      expect(mockStore.setTrackPosition).toHaveBeenCalledWith(0)
    })

    it('should handle volume changed event', () => {
      const volumeCallback = mockMopidy.on.mock.calls.find(
        (call) => call[0] === 'event:volumeChanged',
      )[1]
      volumeCallback({ volume: 75 })

      expect(mockStore.setVolume).toHaveBeenCalledWith(75)
    })

    it('should handle mute changed event', () => {
      const muteCallback = mockMopidy.on.mock.calls.find(
        (call) => call[0] === 'event:muteChanged',
      )[1]
      muteCallback({ mute: true })

      expect(mockStore.setMute).toHaveBeenCalledWith(true)
    })
  })

  describe('playback controls', () => {
    it('should call play on Mopidy', () => {
      mopidyService.play()
      expect(mockMopidy.playback.play).toHaveBeenCalledWith({})
    })

    it('should call pause on Mopidy', () => {
      mopidyService.pause()
      expect(mockMopidy.playback.pause).toHaveBeenCalled()
    })

    it('should call next on Mopidy', () => {
      mopidyService.next()
      expect(mockMopidy.playback.next).toHaveBeenCalled()
    })

    it('should call previous on Mopidy', () => {
      mopidyService.previous()
      expect(mockMopidy.playback.previous).toHaveBeenCalled()
    })

    it('should set volume on Mopidy', () => {
      mopidyService.setVolume(85)
      expect(mockMopidy.mixer.setVolume).toHaveBeenCalledWith({ volume: 85 })
    })

    it('should seek to position on Mopidy', () => {
      mopidyService.seek(45000)
      expect(mockMopidy.playback.seek).toHaveBeenCalledWith({ time_position: 45000 })
    })
  })

  describe('tracklist management', () => {
    it('should fetch tracklist and update store', async () => {
      const mockTracks = [
        { tlid: 1, track: { name: 'Track 1', uri: 'uri:1' } },
        { tlid: 2, track: { name: 'Track 2', uri: 'uri:2' } },
      ]

      mockMopidy.tracklist.getTlTracks.mockResolvedValue(mockTracks)

      await mopidyService.fetchTracklist()

      expect(mockMopidy.tracklist.getTlTracks).toHaveBeenCalled()
      expect(mockStore.setTracklist).toHaveBeenCalledWith([
        { name: 'Track 1', uri: 'uri:1' },
        { name: 'Track 2', uri: 'uri:2' },
      ])
    })

    it('should handle errors when fetching tracklist', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(vi.fn())
      mockMopidy.tracklist.getTlTracks.mockRejectedValue(new Error('Test error'))

      await mopidyService.fetchTracklist()

      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })
  })
})
