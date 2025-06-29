import mopidy from 'mopidy'

export type Image = mopidy.models.Image

export type Artist = Pick<mopidy.models.Artist, 'uri' | 'name'>

export type Album = Pick<
  mopidy.models.Album,
  'uri' | 'name' | 'date' | 'num_tracks' | 'artists'
> & {
  images?: Image[]
}

export type Track = Pick<
  mopidy.models.Track,
  'uri' | 'name' | 'artists' | 'album' | 'length' | 'track_no' | 'date'
>

export interface TlTrack {
  tlid: number // tracklist id, unique for this item in this tracklist
  track: Track
}

export type Playlist = Pick<mopidy.models.Playlist, 'uri' | 'name' | 'last_modified' | 'tracks'>

export enum PlaybackState {
  PLAYING = 'playing',
  PAUSED = 'paused',
  STOPPED = 'stopped',
}

export enum MopidyRefType {
  ARTIST = 'artist',
  ALBUM = 'album',
  TRACK = 'track',
  PLAYLIST = 'playlist',
  DIRECTORY = 'directory', // For browsing file systems or other hierarchical structures
}

// Mopidy's Ref object, used for browsing results
export type MopidyRef<T extends MopidyRefType> = mopidy.models.Ref<T>

export interface SearchResult {
  tracks: Track[]
  albums: Album[]
  artists: Artist[]
  playlists?: Playlist[] // Search can also return playlists
}
