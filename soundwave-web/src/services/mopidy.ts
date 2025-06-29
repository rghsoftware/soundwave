import Mopidy from 'mopidy'
import { useMopidyStore } from '@/stores/mopidy'
import { PlaybackState } from '@/types'
import type { Track, TlTrack } from '@/types'

type MopidyStore = ReturnType<typeof useMopidyStore>

export class MopidyService {
  private mopidy: Mopidy
  private store: MopidyStore
  private positionInterval: number | null = null

  constructor(store: MopidyStore) {
    this.store = store
    this.mopidy = new Mopidy({
      webSocketUrl: 'ws://localhost:6680/mopidy/ws/', // Default Mopidy URL
    })

    this.setupEventListeners()
  }

  private setupEventListeners(): void {
    this.mopidy.on('state:online', () => {
      console.log('Mopidy connected')
      this.store.setConnected(true)
      this.store.setError(null)
      this.store.setPlaybackState(PlaybackState.PAUSED)
      this.store.setVolume(50)
      // Fetch initial state once connected
      this.fetchInitialState()
    })

    this.mopidy.on('state:offline', () => {
      console.error('Mopidy disconnected')
      this.store.setConnected(false)
      this.store.setError('Connection lost. Is Mopidy server running?')
      this.stopPositionPolling()
    })

    this.mopidy.on('event:trackPlaybackStarted', ({ tl_track }) => {
      console.log('Playback started:', tl_track.track)
      this.store.setCurrentTrack(tl_track.track as Track)
      this.store.setPlaybackState(PlaybackState.PLAYING)
      this.startPositionPolling()
    })

    this.mopidy.on('event:trackPlaybackEnded', () => {
      this.stopPositionPolling(true)
    })

    this.mopidy.on('event:playbackStateChanged', ({ old_state, new_state }) => {
      console.log(`Playback state changed from ${old_state} to ${new_state}`)
      this.store.setPlaybackState(new_state as PlaybackState)
    })

    this.mopidy.on('event:volumeChanged', ({ volume }) => {
      console.log(`Volume changed to ${volume}`)

      this.store.setVolume(volume)
    })

    this.mopidy.on('event:muteChanged', ({ mute }) => {
      this.store.setMute(mute)
    })

    this.mopidy.on('event:tracklistChanged', () => {
      this.fetchTracklist()
    })
  }

  public connect(): void {
    this.mopidy.connect()
  }

  public disconnect(): void {
    this.mopidy.close()
  }

  private startPositionPolling(): void {
    this.stopPositionPolling(false) // Clear any existing interval
    this.positionInterval = window.setInterval(async () => {
      try {
        const position = await this.mopidy.playback?.getTimePosition()
        this.store.setTrackPosition(position as number)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_e) {
        // Ignore errors, which can happen if state changes during poll
      }
    }, 1000)
  }

  private stopPositionPolling(reset: boolean = true): void {
    if (this.positionInterval) {
      clearInterval(this.positionInterval)
      this.positionInterval = null
    }
    if (reset) {
      this.store.setTrackPosition(0)
    }
  }
  private async fetchInitialState(): Promise<void> {
    try {
      const [state, currentTrack, volume, mute] = await Promise.all([
        this.mopidy.playback?.getState(),
        this.mopidy.playback?.getCurrentTrack(),
        this.mopidy.mixer?.getVolume(),
        this.mopidy.mixer?.getMute(),
      ])

      this.store.setPlaybackState(state as PlaybackState)
      this.store.setCurrentTrack(currentTrack as Track | null)
      this.store.setVolume(volume as number)
      this.store.setMute(mute as boolean)

      if (state === PlaybackState.PLAYING) {
        const position = await this.mopidy.playback?.getTimePosition()
        this.store.setTrackPosition(position as number)
        this.startPositionPolling()
      }

      this.fetchTracklist()
    } catch (e) {
      console.error('Error fetching initial state:', e)
      this.store.setError('Failed to fetch initial state.')
    }
  }

  public async fetchTracklist(): Promise<void> {
    try {
      const tlTracks = (await this.mopidy.tracklist?.getTlTracks()) || []
      // Mopidy returns tl_tracks, we extract the actual track objects
      const tracks = tlTracks.map((tlTrack: TlTrack) => tlTrack.track)
      this.store.setTracklist(tracks as Track[])
    } catch (e) {
      console.error('Error fetching tracklist:', e)
    }
  }

  // --- Playback Controls ---

  public play(): void {
    // The API requires an empty object to play the current track or resume playback
    this.mopidy.playback?.play({})
  }

  public pause(): void {
    this.mopidy.playback?.pause()
  }

  public next(): void {
    this.mopidy.playback?.next()
  }

  public previous(): void {
    this.mopidy.playback?.previous()
  }

  public setVolume(volume: number): void {
    this.mopidy.mixer?.setVolume({ volume })
  }

  public seek(timePosition: number): void {
    // timePosition should be in milliseconds
    this.mopidy.playback?.seek({ time_position: timePosition })
  }
}
