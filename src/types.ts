// TMDb Metadata Types
export interface TMDbMedia {
  id: number;
  title?: string;
  name?: string;
  original_title?: string;
  original_name?: string;
  overview: string;
  poster_path?: string;
  backdrop_path?: string;
  media_type?: 'movie' | 'tv';
  vote_average?: number;
  release_date?: string;
  first_air_date?: string;
  genre_ids?: number[];
}

export interface TMDbSeason {
  air_date: string;
  episode_count: number;
  id: number;
  name: string;
  overview: string;
  poster_path: string;
  season_number: number;
}

export interface TMDbEpisode {
  air_date: string;
  episode_number: number;
  id: number;
  name: string;
  overview: string;
  still_path?: string;
  vote_average?: number;
}

export interface TMDbMediaDetail extends TMDbMedia {
  genres?: { id: number; name: string }[];
  seasons?: TMDbSeason[];
  runtime?: number;
  status?: string;
  tagline?: string;
  credits?: {
    cast: any[];
    crew: any[];
  };
  videos?: {
    results: any[];
  };
}

export interface TMDbPersonDetail {
  id: number;
  name: string;
  biography: string;
  birthday?: string;
  place_of_birth?: string;
  profile_path?: string;
  known_for_department: string;
}

// Scraped Stream Model
export type StreamProvider = 'Torrentio' | 'NoTorrent' | 'StreamViX' | 'HdHub';
export type StreamCategory = 'hd' | 'free';

export interface StreamLink {
  id: string;
  provider: StreamProvider;
  category: StreamCategory;
  resolution: string; // '4K', '1080p', '720p', 'Other'
  title: string;
  url: string; // Direct URL or cached/magnet
  size?: string;
  seeds?: number;
  isPremium: boolean;
  
  // Sorting weights
  categoryWeight: number;
  resolutionWeight: number;
  totalWeight: number;
  
  // Raw stream metadata for deep debug
  originalData?: any;
}

// Application Settings
export interface AppSettings {
  // Scraper custom config strings
  torrentioConfig: string;
  streamVixConfig: string;
  hdHubConfig: string;

  // Automation
  autoSelect4K: boolean;
  autoPlayHdHubEnglish: boolean;

  // Playback integration
  playerMode: 'builtin' | 'android_intent';
  targetIntentPackage: string; // 'org.videolan.vlc' | 'com.mxtech.videoplayer.ad' | etc.
}

// Scraper Execution Status
export interface ScraperThreadStatus {
  provider: StreamProvider;
  status: 'idle' | 'querying' | 'success' | 'error';
  streamsFound: number;
  errorMessage?: string;
  executionTimeMs?: number;
}

// Playback Progress & History Tracking Models
export interface ContinueWatchingItem {
  id: string; // media.id.toString()
  media: TMDbMedia;
  stream: StreamLink;
  currentTime: number;
  duration: number;
  season?: number;
  episode?: number;
  updatedAt: number;
}

export interface WatchHistoryItem {
  id: string; // unique ID
  media: TMDbMedia;
  stream: StreamLink;
  timestamp: number;
  season?: number;
  episode?: number;
}
