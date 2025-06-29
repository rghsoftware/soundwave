import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import NowPlayingCard from '../NowPlayingCard.vue'
import { PlaybackState } from '@/types'

// Mock the Mopidy store
vi.mock('@/stores/mopidy', () => ({
  useMopidyStore: vi.fn(() => mockMopidyStore),
}))

// Create mock store with default values
const mockMopidyStore = {
  albumArt: null,
  currentTrack: null,
  formattedArtist: '',
  trackPosition: 0,
  playbackState: PlaybackState.STOPPED,
  formattedTrackPosition: '0:00',
  formattedTrackLength: '0:00',
}

// Mock Mopidy service
const mockMopidyService = {
  previous: vi.fn(),
  next: vi.fn(),
  play: vi.fn(),
  setVolume: vi.fn(),
}

describe('NowPlayingCard.vue', () => {
  beforeEach(() => {
    // Reset mock values and function calls before each test
    vi.clearAllMocks()
    mockMopidyStore.albumArt = null
    mockMopidyStore.currentTrack = null
    mockMopidyStore.formattedArtist = ''
    mockMopidyStore.trackPosition = 0
    mockMopidyStore.playbackState = PlaybackState.STOPPED
    mockMopidyStore.formattedTrackPosition = '0:00'
    mockMopidyStore.formattedTrackLength = '0:00'
  })

  function createWrapper() {
    return mount(NowPlayingCard, {
      global: {
        provide: {
          mopidyService: mockMopidyService,
        },
      },
    })
  }

  it('renders nothing playing state when no track is loaded', async () => {
    const wrapper = createWrapper()

    expect(wrapper.find('h3').text()).toBe('Nothing Playing')
    expect(wrapper.find('img').attributes('src')).toContain('placehold.co')
    expect(wrapper.find('.fa-play-circle').exists()).toBe(true)
    expect(wrapper.find('.fa-pause-circle').exists()).toBe(false)
  })

  it('renders track information when a track is loaded', async () => {
    mockMopidyStore.currentTrack = {
      name: 'Test Track',
      length: 180000, // 3 minutes in ms
    }
    mockMopidyStore.formattedArtist = 'Test Artist'
    mockMopidyStore.formattedTrackLength = '3:00'

    const wrapper = createWrapper()

    expect(wrapper.find('h3').text()).toBe('Test Track')
    expect(wrapper.find('p').text()).toBe('Test Artist')
    expect(wrapper.find('.flex.justify-between span:last-child').text()).toBe('3:00')
  })

  it('shows album art when available', async () => {
    mockMopidyStore.albumArt = 'http://example.com/album.jpg'

    const wrapper = createWrapper()

    expect(wrapper.find('img').attributes('src')).toBe('http://example.com/album.jpg')
  })

  it('shows play icon when playback is paused or stopped', async () => {
    mockMopidyStore.playbackState = PlaybackState.PAUSED

    const wrapper = createWrapper()

    expect(wrapper.find('.fa-play-circle').exists()).toBe(true)
    expect(wrapper.find('.fa-pause-circle').exists()).toBe(false)
  })

  it('shows pause icon when playback is playing', async () => {
    mockMopidyStore.playbackState = PlaybackState.PLAYING

    const wrapper = createWrapper()

    expect(wrapper.find('.fa-pause-circle').exists()).toBe(true)
    expect(wrapper.find('.fa-play-circle').exists()).toBe(false)
  })

  it('calculates progress percentage correctly', async () => {
    mockMopidyStore.currentTrack = {
      name: 'Test Track',
      length: 200000, // 200 seconds in ms
    }
    mockMopidyStore.trackPosition = 50000 // 50 seconds (25%)

    const wrapper = createWrapper()

    // Check the width style of the progress bar
    const progressBar = wrapper.find('.bg-primary')
    expect(progressBar.attributes('style')).toContain('width: 25%')
  })

  it('calls previous when backward button is clicked', async () => {
    const wrapper = createWrapper()

    await wrapper.find('button:first-child').trigger('click')

    expect(mockMopidyService.previous).toHaveBeenCalledTimes(1)
  })

  it('calls play when play/pause button is clicked', async () => {
    const wrapper = createWrapper()

    await wrapper.find('button:nth-child(2)').trigger('click')

    expect(mockMopidyService.play).toHaveBeenCalledTimes(1)
  })

  it('calls next when forward button is clicked', async () => {
    const wrapper = createWrapper()

    await wrapper.find('button:nth-child(3)').trigger('click')

    expect(mockMopidyService.next).toHaveBeenCalledTimes(1)
  })

  it('calls setVolume when volume slider is adjusted', async () => {
    const wrapper = createWrapper()

    // Simulate user changing volume to 75
    await wrapper.find('input[type="range"]').setValue(75)
    await wrapper.find('input[type="range"]').trigger('input')

    expect(mockMopidyService.setVolume).toHaveBeenCalledWith(75)
  })

  it('handles zero length track gracefully', async () => {
    mockMopidyStore.currentTrack = {
      name: 'Zero Length Track',
      length: 0,
    }

    const wrapper = createWrapper()
    const progressBar = wrapper.find('.bg-primary')

    // Progress should be 0% to avoid NaN or division by zero issues
    expect(progressBar.attributes('style')).toContain('width: 0%')
  })
})
