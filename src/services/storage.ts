import { TMDbMedia, StreamLink, ContinueWatchingItem, WatchHistoryItem } from '../types';

const WATCHLIST_KEY = 'leestreamtv:watchlist';
const CONTINUE_WATCHING_KEY = 'leestreamtv:continue_watching';
const HISTORY_KEY = 'leestreamtv:history';

// Watchlist Helpers
export function getWatchlist(): TMDbMedia[] {
  try {
    const raw = localStorage.getItem(WATCHLIST_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to parse watchlist from storage', e);
    return [];
  }
}

export function saveWatchlist(list: TMDbMedia[]): void {
  try {
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Failed to save watchlist to storage', e);
  }
}

export function addToWatchlist(media: TMDbMedia): TMDbMedia[] {
  const current = getWatchlist();
  if (current.some(item => item.id === media.id)) {
    return current;
  }
  const updated = [media, ...current];
  saveWatchlist(updated);
  return updated;
}

export function removeFromWatchlist(mediaId: number): TMDbMedia[] {
  const current = getWatchlist();
  const updated = current.filter(item => item.id !== mediaId);
  saveWatchlist(updated);
  return updated;
}

// Continue Watching Helpers
export function getContinueWatching(): ContinueWatchingItem[] {
  try {
    const raw = localStorage.getItem(CONTINUE_WATCHING_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to parse continue watching from storage', e);
    return [];
  }
}

export function saveContinueWatching(list: ContinueWatchingItem[]): void {
  try {
    localStorage.setItem(CONTINUE_WATCHING_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Failed to save continue watching to storage', e);
  }
}

export function saveProgress(
  media: TMDbMedia,
  stream: StreamLink,
  currentTime: number,
  duration: number,
  season?: number,
  episode?: number
): ContinueWatchingItem[] {
  const current = getContinueWatching();
  const id = media.id.toString();
  
  // Filter out existing progress for this title to avoid duplicates
  const filtered = current.filter(item => item.id !== id);
  
  const newItem: ContinueWatchingItem = {
    id,
    media,
    stream,
    currentTime,
    duration,
    season,
    episode,
    updatedAt: Date.now()
  };
  
  // Prepend to show most recently watched first
  const updated = [newItem, ...filtered];
  saveContinueWatching(updated);
  return updated;
}

export function removeProgress(mediaId: number): ContinueWatchingItem[] {
  const current = getContinueWatching();
  const updated = current.filter(item => item.id !== mediaId.toString());
  saveContinueWatching(updated);
  return updated;
}

// Watch History Helpers
export function getWatchHistory(): WatchHistoryItem[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to parse history from storage', e);
    return [];
  }
}

export function saveWatchHistory(list: WatchHistoryItem[]): void {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Failed to save history to storage', e);
  }
}

export function addToHistory(
  media: TMDbMedia,
  stream: StreamLink,
  season?: number,
  episode?: number
): WatchHistoryItem[] {
  const current = getWatchHistory();
  const newItem: WatchHistoryItem = {
    id: `${media.id}-${Date.now()}`,
    media,
    stream,
    timestamp: Date.now(),
    season,
    episode
  };
  
  // Limit history items to 50 for storage optimization
  const updated = [newItem, ...current].slice(0, 50);
  saveWatchHistory(updated);
  return updated;
}

export function clearHistory(): WatchHistoryItem[] {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch (e) {
    console.error('Failed to clear history', e);
  }
  return [];
}
