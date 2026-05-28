import { AppSettings } from '../types';

// Default Scraper Configuration Constants
export const DEFAULT_TORRENTIO_CONFIG = 'providers=yts,eztv,rarbg,1337x,thepiratebay,torrentgalaxy';
export const DEFAULT_STREAMVIX_CONFIG = 'eyJ0bWRiQXBpS2V5IjoiIiwibWVkaWFGbG93UHJveHlVcmwiOiIiLCJtZWRpYUZsb3dQcm94eVBhc3N3b3JkIjoiIiwiYW5pbWV1bml0eUVuYWJsZWQiOiJvbiIsImFuaW1lc2F0dXJuRW5hYmxlZCI6Im9uIiwiYW5pbWV3b3JsZEVuYWJsZWQiOiJvbiJ9';
export const DEFAULT_HDHUB_CONFIG = 'eyJ0b3Jib3giOiJ1bnNldCIsInF1YWxpdGllcyI6IjIxNjBwLDEwODBwLDcyMHAiLCJzb3J0IjoiZGVzYyJ9';

const STORAGE_KEY = 'leestreamtv_settings_v1';

export const defaultSettings: AppSettings = {
  torrentioConfig: DEFAULT_TORRENTIO_CONFIG,
  streamVixConfig: DEFAULT_STREAMVIX_CONFIG,
  hdHubConfig: DEFAULT_HDHUB_CONFIG,
  autoSelect4K: false,
  autoPlayHdHubEnglish: true,
  playerMode: 'builtin',
  targetIntentPackage: 'org.videolan.vlc'
};

export function loadSettings(): AppSettings {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...defaultSettings, ...parsed };
    }
  } catch (err) {
    console.error('Failed to load settings from localStorage', err);
  }
  return defaultSettings;
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save settings to localStorage', err);
  }
}
