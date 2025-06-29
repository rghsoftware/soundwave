export interface Image {
  uri: string
  width?: number
  height?: number
}

export interface Artist {
  uri: string
  name: string
  images?: Image[] // For artist images if available
}

export interface Album {
  uri: string
  name: string
  artists?: Artist[]
  images?: Image[]
  date?: string
  num_tracks?: number
}

export interface Track {
  uri: string
  name: string
  artists?: Artist[]
  album?: Album
  duration_ms?: number // Mopidy uses milliseconds
  track_no?: number
  // images are typically derived from album
}

export interface Playlist {
  uri: string
  name: string
  tracks?: Track[] // Can be populated or fetched separately
  last_modified?: number // Timestamp
  images?: Image[] // For playlist cover images
}

export enum PlaybackState {
  PLAYING = 'playing',
  PAUSED = 'paused',
  STOPPED = 'stopped',
}

// Represents a track within Mopidy's tracklist context (has tlid)
export interface MopidyTracklistTrack {
  tlid: number // tracklist id, unique for this item in this tracklist
  track: Track
}

export enum MopidyRefType {
  ARTIST = 'artist',
  ALBUM = 'album',
  TRACK = 'track',
  PLAYLIST = 'playlist',
  DIRECTORY = 'directory', // For browsing file systems or other hierarchical structures
}

// Mopidy's Ref object, used for browsing results
export interface MopidyRef {
  uri: string
  name: string
  type: MopidyRefType
}

export interface BrowseResultItem extends MopidyRef {}

export interface SearchResult {
  tracks: Track[]
  albums: Album[]
  artists: Artist[]
  playlists?: Playlist[] // Search can also return playlists
}

export interface PlayingTime {
  current: number // in milliseconds
  total: number // in milliseconds
}
