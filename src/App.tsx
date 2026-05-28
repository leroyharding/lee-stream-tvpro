import { useEffect, useState, useCallback } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';

// Components
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { MediaGrid } from './components/MediaGrid';
import { MediaDetailModal } from './components/MediaDetailModal';
import { ScraperConsole } from './components/ScraperConsole';
import { SettingsModal } from './components/SettingsModal';
import { VideoPlayer } from './components/VideoPlayer';
import { PersonDetailModal } from './components/PersonDetailModal';
import { SplashScreen } from './components/SplashScreen';
import { PosterContextMenuModal } from './components/PosterContextMenuModal';
import { HydraCollections } from './components/HydraCollections';

// Types & Services
import { AppSettings, TMDbMedia, StreamLink, ContinueWatchingItem, WatchHistoryItem } from './types';
import { loadSettings, saveSettings } from './services/settings';
import { getTrendingMovies, getTrendingShows, searchMulti, getImageUrl, getGenres, discoverByGenre, discoverMoviesByYear, discoverShowsByYear } from './services/tmdb';
import { launchAndroidIntent } from './services/playerIntent';
import { initSpatialNavigation } from './services/spatialNavigation';
import { Radio, Heart, Layers, ShieldCheck, Trash2, Play, Bookmark, Clock, Film, Download, WifiOff, ChevronLeft, Calendar } from 'lucide-react';

const genreGradients: Record<string, string> = {
  'Action': 'from-red-650 to-orange-600',
  'Action & Adventure': 'from-red-650 to-orange-600',
  'Adventure': 'from-orange-655 to-yellow-600',
  'Animation': 'from-pink-500 to-purple-605',
  'Comedy': 'from-yellow-500 to-amber-500',
  'Crime': 'from-slate-850 to-neutral-900',
  'Documentary': 'from-teal-600 to-emerald-600',
  'Drama': 'from-blue-650 to-indigo-700',
  'Family': 'from-green-500 to-teal-500',
  'Fantasy': 'from-purple-605 to-pink-600',
  'History': 'from-stone-700 to-amber-800',
  'Horror': 'from-purple-950 to-red-950 border border-red-900/30',
  'Music': 'from-rose-500 to-purple-500',
  'Mystery': 'from-violet-800 to-fuchsia-900',
  'Romance': 'from-pink-500 to-rose-605',
  'Science Fiction': 'from-cyan-600 to-blue-600',
  'Sci-Fi & Fantasy': 'from-cyan-600 to-blue-600',
  'TV Movie': 'from-indigo-600 to-sky-600',
  'Thriller': 'from-red-950 to-neutral-900 border border-red-900/30',
  'War': 'from-amber-900 to-stone-800',
  'War & Politics': 'from-amber-900 to-stone-800',
  'Western': 'from-orange-800 to-yellow-800',
};

const genreImages: Record<'movie' | 'tv', Record<number, { backdrop: string; poster: string }>> = {
  movie: {
    12: { backdrop: '/5XNQBqnBwPA9yT0jZ0p3s8bbLh0.jpg', poster: '/yQvGrMoipbRoddT0ZR8tPoR7NfX.jpg' }, // Adventure (Interstellar)
    14: { backdrop: '/a0lfia8tk8ifkrve0Tn8wkISUvs.jpg', poster: '/6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg' }, // Fantasy (LOTR: Fellowship)
    16: { backdrop: '/dyJvKsNs2KP8qQnAXbRwDjblViy.jpg', poster: '/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg' }, // Animation (Spirited Away)
    18: { backdrop: '/zfbjgQE1uSd9wiPTX4VzsLi0rGG.jpg', poster: '/9cqNxx0GxF0bflZmeSMuL5tnGzr.jpg' }, // Drama (Shawshank Redemption)
    27: { backdrop: '/mmd1HnuvAzFc4iuVJcnBrhDNEKr.jpg', poster: '/uAR0AWqhQL1hQa69UDEbb2rE5Wx.jpg' }, // Horror (The Shining)
    28: { backdrop: '/uT895WNwm0aIJRtGizcQhrejWUo.jpg', poster: '/hA2ple9q4qnwxp3hKVNhroipsir.jpg' }, // Action (Mad Max: Fury Road)
    35: { backdrop: '/iuRVt8tFiXDPGgzavhuSa3QHRxD.jpg', poster: '/A0uS9rHR56FeBtpjVki16M5xxSW.jpg' }, // Comedy (The Hangover)
    36: { backdrop: '/zb6fM1CX41D9rF9hdgclu0peUmy.jpg', poster: '/sF1U4EUQS8YHUYjNl3pMGNIQyr0.jpg' }, // History (Schindler's List)
    37: { backdrop: '/2oZklIzUbvZXXzIFzv7Hi68d6xf.jpg', poster: '/mhf63wOnaLCnzxeHgngTH98WaVh.jpg' }, // Western (Django Unchained)
    53: { backdrop: '/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg', poster: '/xlaY2zyzMfkhk0HSC5VUwzoZPU1.jpg' }, // Thriller (Inception)
    80: { backdrop: '/tSPT36ZKlP2WVHJLM4cQPLSzv3b.jpg', poster: '/3bhkrj58Vtu7enYsRolD1fZdja1.jpg' }, // Crime (The Godfather)
    99: { backdrop: '/lPsKI7VR1FJY3w8iEOBZEhWAESc.jpg', poster: '/o9xJ1xG1WKlHkl8ACqq0LShOuMu.jpg' }, // Documentary (March of the Penguins)
    878: { backdrop: '/mVr0UiqyltcfqxbAUcLl9zWL8ah.jpg', poster: '/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg' }, // Science Fiction (Blade Runner 2049)
    9648: { backdrop: '/rbZvGN1A1QyZuoKzhCw8QPmf2q0.jpg', poster: '/nrmXQ0zcZUL8jFLrakWc90IR8z9.jpg' }, // Mystery (Shutter Island)
    10402: { backdrop: '/nlPCdZlHtRNcF6C9hzUH4ebmV1w.jpg', poster: '/uDO8zWDhfWwoFdKS4fzkUJt0Rf0.jpg' }, // Music (La La Land)
    10749: { backdrop: '/xnHVX37XZEp33hhCbYlQFq7ux1J.jpg', poster: '/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg' }, // Romance (Titanic)
    10751: { backdrop: '/1XAC6RPT01UX9EQGy2JVn5c8pgy.jpg', poster: '/wuMc08IPKEatf9rnMNXvIDxqP4W.jpg' }, // Family (Harry Potter 1)
    10752: { backdrop: '/bdD39MpSVhKjxarTxLSfX6baoMP.jpg', poster: '/uqx37cS8cpHg8U35f9U5IBlrCV3.jpg' }, // War (Saving Private Ryan)
    10770: { backdrop: '/uLXK1LQM28XovWHPao3ViTeggXA.jpg', poster: '/ePXuKdXZuJx8hHMNr2yM4jY2L7Z.jpg' }, // TV Movie (El Camino)
  },
  tv: {
    16: { backdrop: '/q8eejQcg1bAqImEV8jh8RtBD4uH.jpg', poster: '/abf8tHznhSvl9BAElD2cQeRr7do.jpg' }, // Animation (Arcane)
    18: { backdrop: '/2OMB0ynKlyIenMJWI2Dy9IWT4c.jpg', poster: '/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg' }, // Drama (Game of Thrones)
    35: { backdrop: '/mLyW3UTgi2lsMdtueYODcfAB9Ku.jpg', poster: '/7DJKHzAi83BmQrWLrYYOqcoKfhR.jpg' }, // Comedy (The Office)
    37: { backdrop: '/ynSOcgDLZfdLCZfRSYZGiTgYJVo.jpg', poster: '/vOYfRZ0NpUK5hG2CB2dJFnYJlGe.jpg' }, // Western (Yellowstone)
    80: { backdrop: '/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg', poster: '/ztkUQFLlC19CCMYHW9o1zWhJRNq.jpg' }, // Crime (Breaking Bad)
    99: { backdrop: '/p8EUX6MPSNLxVwqO3fCYTi896Ro.jpg', poster: '/wRSnArnQBmeUYb5GWDU595bGsBr.jpg' }, // Documentary (Our Planet)
    9648: { backdrop: '/56v2KjBlU4XaOv9rVYEQypROD7P.jpg', poster: '/uOOtwVbSr4QDjAGIifLDwpb2Pdl.jpg' }, // Mystery (Stranger Things)
    10751: { backdrop: '/7oBGhqJIghRBvOwo5Qe0yM0cnMc.jpg', poster: '/9RQhVb3r3mCMqYVhLoCu4EvuipP.jpg' }, // Family (Avatar: TLA)
    10759: { backdrop: '/9zcbqSxdsRMZWHYtyCd1nXPr2xq.jpg', poster: '/sWgBv7LV2PRoQgkxwlibdGXKz1S.jpg' }, // Action & Adventure (The Mandalorian)
    10762: { backdrop: '/g88VMPtog8sl8riaIRtz4U80dMK.jpg', poster: '/b9mY0X5T20ZM073hoa5n0dgmbfN.jpg' }, // Kids (Bluey)
    10763: { backdrop: '/qLMfcvdCcCGD2BNLH8b6ZCBuO7D.jpg', poster: '/ixcfyK7it6FjRM36Te4OdblAq4X.jpg' }, // News (The Daily Show)
    10764: { backdrop: '/4WdtTK5SbeXsYeloXHI2WTpgvdE.jpg', poster: '/1usR1nanbDvnc0LJlWd5TOylT9M.jpg' }, // Reality (Survivor)
    10765: { backdrop: '/foGkPxpw9h8zln81j63mix5B7m8.jpg', poster: '/AoGsDM02UVt0npBA8OvpDcZbaMi.jpg' }, // Sci-Fi & Fantasy (The Witcher)
    10766: { backdrop: '/jP0Rhj9OTPDAwQlHQwOLFDdeE8t.jpg', poster: '/hjJkrLXhWvGHpLeLBDFznpBTY1S.jpg' }, // Soap (Grey's Anatomy)
    10767: { backdrop: '/7VO04TtL1jIT6XOPs9u4jdB8KaB.jpg', poster: '/1N4o5PmmqhlVDrcdJ2RlCFWbLGX.jpg' }, // Talk (The Tonight Show)
    10768: { backdrop: '/A3bigAAa4u6EbDvmMpDc0GNIEtG.jpg', poster: '/hKWxWjFwnMvkWQawbhvC0Y7ygQ8.jpg' }, // War & Politics (House of Cards)
  }
};


import {
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  getContinueWatching,
  saveProgress,
  removeProgress,
  getWatchHistory,
  addToHistory,
  clearHistory
} from './services/storage';

const yearFilterOptions = [
  { label: 'All Years', value: '' },
  { label: '2026', value: '2026' },
  { label: '2025', value: '2025' },
  { label: '2024', value: '2024' },
  { label: '2023', value: '2023' },
  { label: '2022', value: '2022' },
  { label: '2021', value: '2021' },
  { label: '2020', value: '2020' },
  { label: '2010s', value: '2010s' },
  { label: '2000s', value: '2000s' },
  { label: 'Older', value: 'older' }
];

const filterMediaByYear = (items: TMDbMedia[], filterValue: string) => {
  if (!filterValue) return items;
  return items.filter(item => {
    const dateStr = item.release_date || item.first_air_date || '';
    if (!dateStr) return false;
    const yearStr = dateStr.split('-')[0];
    const year = parseInt(yearStr);
    if (isNaN(year)) return false;

    if (filterValue.endsWith('s')) {
      const decadeStart = parseInt(filterValue);
      return year >= decadeStart && year < decadeStart + 10;
    }
    if (filterValue === 'older') {
      return year < 2000;
    }
    return yearStr === filterValue;
  });
};

export default function App() {
  const [settings, setSettingsState] = useState<AppSettings>(() => loadSettings());
  
  // TV Mode Detection & Lifecycle Hooks
  const [isTvMode, setIsTvMode] = useState<boolean>(() => {
    const ua = navigator.userAgent.toLowerCase();
    return (
      ua.includes('googletv') ||
      ua.includes('aftb') || // Fire TV
      ua.includes('aftm') || // Fire TV
      ua.includes('androidtv') ||
      ua.includes('smarttv') ||
      ua.includes('appletv') ||
      ua.includes('roku')
    );
  });

  // Navigation
  const navigate = useNavigate();
  const location = useLocation();
  const currentTab = location.pathname.split('/')[1] || 'home';
  const setCurrentTab = (tab: string) => navigate('/' + tab);
  
  // Catalog State
  const [trendingMovies, setTrendingMovies] = useState<TMDbMedia[]>([]);
  const [trendingShows, setTrendingShows] = useState<TMDbMedia[]>([]);
  const [searchResults, setSearchResults] = useState<TMDbMedia[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Date Filters State
  const [moviesYearFilter, setMoviesYearFilter] = useState<string>('');
  const [showsYearFilter, setShowsYearFilter] = useState<string>('');
  const [searchYearFilter, setSearchYearFilter] = useState<string>('');

  // Year-filtered discover results (fetched from /discover endpoint)
  const [yearMovies, setYearMovies] = useState<TMDbMedia[]>([]);
  const [yearShows, setYearShows] = useState<TMDbMedia[]>([]);
  const [yearMoviesPage, setYearMoviesPage] = useState(1);
  const [yearShowsPage, setYearShowsPage] = useState(1);
  const [loadingYearMovies, setLoadingYearMovies] = useState(false);
  const [loadingYearShows, setLoadingYearShows] = useState(false);

  // Fetch year-specific movies when filter changes
  useEffect(() => {
    if (!moviesYearFilter) {
      setYearMovies([]);
      setYearMoviesPage(1);
      return;
    }
    let cancelled = false;
    setLoadingYearMovies(true);
    discoverMoviesByYear(moviesYearFilter, 1).then(res => {
      if (!cancelled) {
        setYearMovies(res.results || []);
        setYearMoviesPage(1);
      }
    }).catch(err => console.error('Year movies fetch failed', err))
      .finally(() => { if (!cancelled) setLoadingYearMovies(false); });
    return () => { cancelled = true; };
  }, [moviesYearFilter]);

  // Fetch year-specific shows when filter changes
  useEffect(() => {
    if (!showsYearFilter) {
      setYearShows([]);
      setYearShowsPage(1);
      return;
    }
    let cancelled = false;
    setLoadingYearShows(true);
    discoverShowsByYear(showsYearFilter, 1).then(res => {
      if (!cancelled) {
        setYearShows(res.results || []);
        setYearShowsPage(1);
      }
    }).catch(err => console.error('Year shows fetch failed', err))
      .finally(() => { if (!cancelled) setLoadingYearShows(false); });
    return () => { cancelled = true; };
  }, [showsYearFilter]);

  // Reset filters on route changes
  useEffect(() => {
    setMoviesYearFilter('');
    setShowsYearFilter('');
    setSearchYearFilter('');
  }, [location.pathname]);
  
  const [loadingCatalog, setLoadingCatalog] = useState<boolean>(true);
  const [catalogError, setCatalogError] = useState<string>('');

  // Splash Screen / Boot Animation State
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [splashExiting, setSplashExiting] = useState<boolean>(false);

  // Pagination & Loading More
  const [moviesPage, setMoviesPage] = useState<number>(5);
  const [showsPage, setShowsPage] = useState<number>(5);
  const [loadingMoreMovies, setLoadingMoreMovies] = useState<boolean>(false);
  const [loadingMoreShows, setLoadingMoreShows] = useState<boolean>(false);

  // Modals & Active Targets
  const [selectedMedia, setSelectedMedia] = useState<TMDbMedia | null>(null);
  const [activeStream, setActiveStream] = useState<StreamLink | null>(null);
  const [selectedPerson, setSelectedPerson] = useState<{ id: number; name: string } | null>(null);
  const [contextMenuMedia, setContextMenuMedia] = useState<TMDbMedia | null>(null);

  // Watchlist & Favourites States
  const [watchlist, setWatchlist] = useState<TMDbMedia[]>(() => getWatchlist());
  const [continueWatching, setContinueWatching] = useState<ContinueWatchingItem[]>(() => getContinueWatching());
  const [history, setHistory] = useState<WatchHistoryItem[]>(() => getWatchHistory());

  // Genre Browsing States
  const [movieGenres, setMovieGenres] = useState<{ id: number; name: string }[]>([]);
  const [tvGenres, setTvGenres] = useState<{ id: number; name: string }[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<{ id: number; name: string; type: 'movie' | 'tv' } | null>(null);
  const [genreResults, setGenreResults] = useState<TMDbMedia[]>([]);
  const [genrePage, setGenrePage] = useState<number>(1);
  const [genreTypeTab, setGenreTypeTab] = useState<'movie' | 'tv'>('movie');
  const [loadingGenreList, setLoadingGenreList] = useState<boolean>(false);
  const [loadingGenreResults, setLoadingGenreResults] = useState<boolean>(false);

  // PWA Install & Offline state
  const [isOffline, setIsOffline] = useState<boolean>(() => !navigator.onLine);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState<boolean>(false);
  const [showInstallToast, setShowInstallToast] = useState<boolean>(false);
  const [installToastDismissed, setInstallToastDismissed] = useState<boolean>(() => {
    return localStorage.getItem('leestreamtv:pwa_dismissed') === 'true';
  });

  // Active Scraped Media Context for player logs
  const [activeScrapedMedia, setActiveScrapedMedia] = useState<{
    media: TMDbMedia;
    season?: number;
    episode?: number;
  } | null>(null);

  const [activePlayerContext, setActivePlayerContext] = useState<{
    media: TMDbMedia;
    season?: number;
    episode?: number;
  } | null>(null);

  // Scraper Stage Configuration
  const [scraperConfig, setScraperConfig] = useState<{
    queryType: 'movie' | 'series';
    queryId: string;
    titleContext: string;
  }>({
    queryType: 'movie',
    queryId: '',
    titleContext: ''
  });

  // Persist settings wrappers
  const handleSaveSettings = (updated: AppSettings) => {
    setSettingsState(updated);
    saveSettings(updated);
  };

  // Watchlist Toggler
  const handleToggleWatchlist = (media: TMDbMedia) => {
    const isAdded = watchlist.some(item => item.id === media.id);
    if (isAdded) {
      const updated = removeFromWatchlist(media.id);
      setWatchlist(updated);
    } else {
      const updated = addToWatchlist(media);
      setWatchlist(updated);
    }
  };

  // Watched Status Toggler (Quick Actions Context Menu)
  const handleToggleWatched = (media: TMDbMedia) => {
    const isWatched = history.some(item => item.media.id === media.id);
    if (isWatched) {
      // Unwatch: Remove all instances from history and clear progress
      const updated = history.filter(item => item.media.id !== media.id);
      setHistory(updated);
      localStorage.setItem('leestreamtv:history', JSON.stringify(updated));
      handleClearProgress(media.id);
    } else {
      // Watch: Add placeholder stream entry to history
      const defaultStream = {
        id: 'marked-watched',
        url: '',
        title: 'Marked as Watched',
        resolution: 'Auto',
        provider: 'System' as any,
        category: 'free' as any,
        isPremium: false,
        categoryWeight: 0,
        resolutionWeight: 0,
        totalWeight: 0,
        size: ''
      } as StreamLink;
      const updated = addToHistory(media, defaultStream);
      setHistory(updated);
    }
  };

  // Clear continue watching progress
  const handleClearProgress = (mediaId: number) => {
    const updated = removeProgress(mediaId);
    setContinueWatching(updated);
  };

  // Close player and save progress callback
  const handleClosePlayer = useCallback((currentTime?: number, duration?: number) => {
    if (activePlayerContext && activeStream && currentTime !== undefined && duration && duration > 0) {
      if (currentTime > 10) {
        if (currentTime > 0.9 * duration) {
          // Finished: remove from continue watching progress
          const updated = removeProgress(activePlayerContext.media.id);
          setContinueWatching(updated);
        } else {
          // In progress: save progress
          const updated = saveProgress(
            activePlayerContext.media,
            activeStream,
            currentTime,
            duration,
            activePlayerContext.season,
            activePlayerContext.episode
          );
          setContinueWatching(updated);
        }
      }
    }
    setActiveStream(null);
    setActivePlayerContext(null);
  }, [activePlayerContext, activeStream]);

  // Lookup progress time for current stream launch
  const getActiveProgressTime = useCallback(() => {
    if (!activePlayerContext) return 0;
    const progressItem = continueWatching.find(item => 
      item.media.id === activePlayerContext.media.id &&
      (activePlayerContext.season === undefined || 
       (item.season === activePlayerContext.season && item.episode === activePlayerContext.episode))
    );
    return progressItem ? progressItem.currentTime : 0;
  }, [activePlayerContext, continueWatching]);

  // Listen for online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Listen for PWA beforeinstallprompt event
  useEffect(() => {
    const handleInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
      if (localStorage.getItem('leestreamtv:pwa_dismissed') !== 'true') {
        const timer = setTimeout(() => {
          setShowInstallToast(true);
        }, 3000);
        return () => clearTimeout(timer);
      }
    };
    window.addEventListener('beforeinstallprompt', handleInstallPrompt);
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstallable(false);
    }
    return () => {
      window.removeEventListener('beforeinstallprompt', handleInstallPrompt);
    };
  }, []);

  const handleInstallPWA = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
      setDeferredPrompt(null);
      setShowInstallToast(false);
    }
  };

  const handleDismissInstallToast = () => {
    setShowInstallToast(false);
    localStorage.setItem('leestreamtv:pwa_dismissed', 'true');
    setInstallToastDismissed(true);
  };

  // Fetch genres on first load
  useEffect(() => {
    async function loadGenres() {
      setLoadingGenreList(true);
      try {
        const [mGenres, tGenres] = await Promise.all([
          getGenres('movie'),
          getGenres('tv')
        ]);
        setMovieGenres(mGenres);
        setTvGenres(tGenres);
      } catch (err) {
        console.error('Failed to load genres list', err);
      } finally {
        setLoadingGenreList(false);
      }
    }
    loadGenres();
  }, []);

  const handleSelectGenre = async (genre: { id: number; name: string; type: 'movie' | 'tv' }) => {
    if (isOffline) {
      alert('You are currently offline. Discovering genres is unavailable.');
      return;
    }
    setSelectedGenre(genre);
    setGenrePage(1);
    setLoadingGenreResults(true);
    try {
      const res = await discoverByGenre(genre.type, genre.id, 1);
      if (res && res.results) {
        setGenreResults(res.results);
      }
    } catch (err) {
      console.error('Failed to discover by genre', err);
    } finally {
      setLoadingGenreResults(false);
    }
  };

  const handleLoadMoreGenreResults = async () => {
    if (!selectedGenre || isOffline) return;
    setLoadingGenreResults(true);
    try {
      const nextPage = genrePage + 1;
      const res = await discoverByGenre(selectedGenre.type, selectedGenre.id, nextPage);
      if (res && res.results) {
        setGenreResults(prev => [...prev, ...(res.results || [])]);
        setGenrePage(nextPage);
      }
    } catch (err) {
      console.error('Failed to load more genre results', err);
    } finally {
      setLoadingGenreResults(false);
    }
  };

  const getGenreBackdrop = (genreId: number, type: 'movie' | 'tv'): string => {
    // Check static curated images map first to avoid duplicate placeholders and load instantly
    const curated = genreImages[type]?.[genreId];
    if (curated && curated.backdrop) {
      return getImageUrl(curated.backdrop, 'w500');
    }

    const items = type === 'movie' ? trendingMovies : trendingShows;
    const match = items.find(item => item.genre_ids && item.genre_ids.includes(genreId));
    if (match && match.backdrop_path) {
      return getImageUrl(match.backdrop_path, 'w500');
    }
    const firstWithBackdrop = items.find(item => item.backdrop_path);
    if (firstWithBackdrop && firstWithBackdrop.backdrop_path) {
      return getImageUrl(firstWithBackdrop.backdrop_path, 'w500');
    }
    return '';
  };

  // Sync isTvMode changes to DOM body class
  useEffect(() => {
    if (isTvMode) {
      document.body.classList.add('tv-mode');
    } else {
      document.body.classList.remove('tv-mode');
    }
  }, [isTvMode]);

  // D-Pad Remote Spatial Navigation and Back Navigation routing
  useEffect(() => {
    const cleanSpatialNav = initSpatialNavigation();

    const handleBackRoute = () => {
      if (activeStream) {
        handleClosePlayer();
      } else if (selectedPerson) {
        setSelectedPerson(null);
      } else if (selectedMedia) {
        setSelectedMedia(null);
      } else if (currentTab === 'genres' && selectedGenre !== null) {
        setSelectedGenre(null);
      } else if (currentTab === 'collections' && location.pathname !== '/collections') {
        navigate('/collections');
      } else if (currentTab !== 'home') {
        setCurrentTab('home');
      }
    };

    const handleTvDetect = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', 'Backspace', 'Escape'].includes(e.key)) {
        setIsTvMode(true);
      }
    };

    window.addEventListener('leestreamtv:back', handleBackRoute);
    window.addEventListener('keydown', handleTvDetect);

    return () => {
      cleanSpatialNav();
      window.removeEventListener('leestreamtv:back', handleBackRoute);
      window.removeEventListener('keydown', handleTvDetect);
    };
  }, [activeStream, selectedMedia, selectedPerson, currentTab, handleClosePlayer, location, navigate]);



  // Initial Data Fetch - Loading 5 pages (100 items) in parallel for rich catalog
  useEffect(() => {
    const startTime = Date.now();
    async function init() {
      setLoadingCatalog(true);
      setCatalogError('');
      try {
        const pages = [1, 2, 3, 4, 5];
        const moviePromises = pages.map(p => getTrendingMovies(p));
        const showPromises = pages.map(p => getTrendingShows(p));

        const [moviesResults, showsResults] = await Promise.all([
          Promise.all(moviePromises),
          Promise.all(showPromises)
        ]);

        const allMovies = moviesResults.flatMap(res => res.results || []);
        const allShows = showsResults.flatMap(res => res.results || []);

        // Deduplicate by ID to prevent React key collisions from TMDb page overlaps
        const dedupeById = (items: TMDbMedia[]) => {
          const seen = new Set<number>();
          return items.filter(item => {
            if (seen.has(item.id)) return false;
            seen.add(item.id);
            return true;
          });
        };

        setTrendingMovies(dedupeById(allMovies));
        setTrendingShows(dedupeById(allShows));
      } catch (err: any) {
        setCatalogError(err.message || 'Failed to initialize media catalog. Check internet connectivity.');
      } finally {
        setLoadingCatalog(false);
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, 2400 - elapsed); // Enforce 2.4s cinematic loading for animations to resolve
        setTimeout(() => {
          setSplashExiting(true);
          setTimeout(() => {
            setShowSplash(false);
          }, 500); // 500ms fade-out transition delay
        }, remaining);
      }
    }
    init();
  }, []);

  // Load More handlers for browse grids
  const handleLoadMoreMovies = async () => {
    if (isOffline) {
      alert('You are currently offline. Cannot load more movies.');
      return;
    }
    setLoadingMoreMovies(true);
    try {
      if (moviesYearFilter) {
        // Year filter active: fetch next page from discover endpoint
        const nextPage = yearMoviesPage + 1;
        const res = await discoverMoviesByYear(moviesYearFilter, nextPage);
        if (res && res.results) {
          setYearMovies(prev => {
            const existingIds = new Set(prev.map(m => m.id));
            const newItems = (res.results || []).filter((m: TMDbMedia) => !existingIds.has(m.id));
            return [...prev, ...newItems];
          });
          setYearMoviesPage(nextPage);
        }
      } else {
        const nextPage = moviesPage + 1;
        const res = await getTrendingMovies(nextPage);
        if (res && res.results) {
          setTrendingMovies(prev => {
            const existingIds = new Set(prev.map(m => m.id));
            const newItems = (res.results || []).filter((m: TMDbMedia) => !existingIds.has(m.id));
            return [...prev, ...newItems];
          });
          setMoviesPage(nextPage);
        }
      }
    } catch (err) {
      console.error('Failed to load more movies', err);
    } finally {
      setLoadingMoreMovies(false);
    }
  };

  const handleLoadMoreShows = async () => {
    if (isOffline) {
      alert('You are currently offline. Cannot load more shows.');
      return;
    }
    setLoadingMoreShows(true);
    try {
      if (showsYearFilter) {
        // Year filter active: fetch next page from discover endpoint
        const nextPage = yearShowsPage + 1;
        const res = await discoverShowsByYear(showsYearFilter, nextPage);
        if (res && res.results) {
          setYearShows(prev => {
            const existingIds = new Set(prev.map(m => m.id));
            const newItems = (res.results || []).filter((m: TMDbMedia) => !existingIds.has(m.id));
            return [...prev, ...newItems];
          });
          setYearShowsPage(nextPage);
        }
      } else {
        const nextPage = showsPage + 1;
        const res = await getTrendingShows(nextPage);
        if (res && res.results) {
          setTrendingShows(prev => {
            const existingIds = new Set(prev.map(m => m.id));
            const newItems = (res.results || []).filter((m: TMDbMedia) => !existingIds.has(m.id));
            return [...prev, ...newItems];
          });
          setShowsPage(nextPage);
        }
      }
    } catch (err) {
      console.error('Failed to load more shows', err);
    } finally {
      setLoadingMoreShows(false);
    }
  };

  // Search handler
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query) return;
    if (isOffline) {
      alert('You are currently offline. Searching is unavailable.');
      return;
    }

    setLoadingCatalog(true);
    try {
      const res = await searchMulti(query, 1);
      if (res && res.results) {
        setSearchResults(res.results);
      }
    } catch (err: any) {
      console.error('Search query failed', err);
    } finally {
      setLoadingCatalog(false);
    }
  };

  // Launch scraping execution from detail modal
  const handleStartScraping = (
    queryType: 'movie' | 'series',
    queryId: string,
    titleContext: string
  ) => {
    if (isOffline) {
      alert('You are currently offline. Scraping links requires an internet connection.');
      return;
    }
    if (selectedMedia) {
      if (queryType === 'series') {
        const parts = queryId.split(':');
        const season = parts[1] ? Number(parts[1]) : undefined;
        const episode = parts[2] ? Number(parts[2]) : undefined;
        setActiveScrapedMedia({ media: selectedMedia, season, episode });
      } else {
        setActiveScrapedMedia({ media: selectedMedia });
      }
    }
    
    setSelectedMedia(null); // Close detail modal
    setScraperConfig({ queryType, queryId, titleContext });
    setCurrentTab('scraper'); // Switch to scraper interface
  };

  // Route triggered by scraper interface when a stream is selected
  const handleLaunchStream = (stream: StreamLink) => {
    // Check execution mode from preferences
    if (settings.playerMode === 'android_intent') {
      launchAndroidIntent({
        url: stream.url,
        title: stream.title,
        packageName: settings.targetIntentPackage
      });
      
      // Log to history directly for external players
      if (activeScrapedMedia) {
        const updatedHistory = addToHistory(
          activeScrapedMedia.media,
          stream,
          activeScrapedMedia.season,
          activeScrapedMedia.episode
        );
        setHistory(updatedHistory);
      }
    } else {
      // Mount embedded HTML5 player overlay
      if (activeScrapedMedia) {
        setActivePlayerContext(activeScrapedMedia);
        // Log to history
        const updatedHistory = addToHistory(
          activeScrapedMedia.media,
          stream,
          activeScrapedMedia.season,
          activeScrapedMedia.episode
        );
        setHistory(updatedHistory);
      }
      setActiveStream(stream);
    }
  };

  // Top 5 trending items for the main rotating hero cover (mix of movies and shows)
  const heroItems = [
    ...trendingMovies.slice(0, 3),
    ...trendingShows.slice(0, 2)
  ].slice(0, 5);

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-red-600 selection:text-white">
      
      {/* Offline Status Banner */}
      {isOffline && (
        <div className="bg-red-650/90 text-white text-xs font-bold py-2.5 px-4 text-center sticky top-0 z-50 flex items-center justify-center gap-2 backdrop-blur-md border-b border-red-500/30 shadow-lg animate-in slide-in-from-top duration-300">
          <WifiOff className="w-4 h-4 text-white animate-pulse" />
          <span>You are currently offline. Browsing Watchlist and History from cached local storage. Scraping is disabled.</span>
        </div>
      )}

      {/* Splash Screen Overlay */}
      {showSplash && <SplashScreen isExiting={splashExiting} />}
      
      {/* Global Header */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          // If leaving search, clear or preserve view
        }}
        onSearch={handleSearch}
        settings={settings}
        isTvMode={isTvMode}
        isInstallable={isInstallable}
        onInstall={handleInstallPWA}
      />

      {/* Primary Content View Container */}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={
            <div className="space-y-4">
              
              {/* Cinematic Hero Cover */}
              {!loadingCatalog && heroItems.length > 0 && (
                <HeroBanner
                  mediaList={heroItems}
                  onSelect={(m) => setSelectedMedia(m)}
                />
              )}

              {catalogError && (
                <div className="max-w-7xl mx-auto px-4 py-8">
                  <div className="bg-rose-950/40 border border-rose-800 text-rose-300 p-4 rounded-xl text-center">
                    {catalogError}
                  </div>
                </div>
              )}

              {/* Continue Watching row */}
              {!loadingCatalog && continueWatching.length > 0 && (
                <div className="max-w-7xl mx-auto">
                  <MediaGrid
                    items={continueWatching.map(item => ({
                      ...item.media,
                      title: item.season !== undefined 
                        ? `${item.media.title || item.media.name} (S${item.season}E${item.episode})`
                        : item.media.title,
                      name: item.season !== undefined 
                        ? `${item.media.name || item.media.title} (S${item.season}E${item.episode})`
                        : item.media.name
                    }))}
                    title="Continue Watching"
                    onSelect={(m) => {
                      setSelectedMedia(m);
                    }}
                    onLongSelect={(m) => setContextMenuMedia(m)}
                    progressMap={continueWatching.reduce((acc, item) => {
                      acc[item.media.id] = item.currentTime / (item.duration || 1);
                      return acc;
                    }, {} as Record<number, number>)}
                    layout={isTvMode ? 'row' : 'grid'}
                  />
                </div>
              )}

              {/* Trending Movies row */}
              <div className="max-w-7xl mx-auto">
                <MediaGrid
                  items={trendingMovies.slice(0, 12)}
                  title="Top Trending Movies"
                  onSelect={(m) => setSelectedMedia(m)}
                  onLongSelect={(m) => setContextMenuMedia(m)}
                  loading={loadingCatalog}
                  layout={isTvMode ? 'row' : 'grid'}
                />
              </div>

              {/* Trending TV Shows row */}
              <div className="max-w-7xl mx-auto">
                <MediaGrid
                  items={trendingShows.slice(0, 12)}
                  title="Top Trending TV Series"
                  onSelect={(m) => setSelectedMedia(m)}
                  onLongSelect={(m) => setContextMenuMedia(m)}
                  loading={loadingCatalog}
                  layout={isTvMode ? 'row' : 'grid'}
                />
              </div>

              {/* Quick Access Bridge Teaser */}
              <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6">
                <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center shrink-0">
                      <Layers className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-white">
                        Direct Parallel Engine Router
                      </h3>
                      <p className="text-slate-400 text-xs sm:text-sm mt-0.5 max-w-xl">
                        Already have an IMDb ID or stream string? Jump straight to the Multi-Threaded scraping hub to resolve links instantly.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setCurrentTab('scraper')}
                    className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs sm:text-sm shrink-0 border border-slate-700 transition-colors"
                  >
                    Open Scraper Console
                  </button>
                </div>
              </div>

            </div>
          } />

          <Route path="/movies" element={
            <div className="max-w-7xl mx-auto py-4 px-4 lg:px-8 space-y-4">
              {/* Year Filter Row */}
              <div className="flex items-center gap-3 bg-zinc-900/30 border border-zinc-800/80 p-2.5 rounded-2xl overflow-x-auto no-scrollbar">
                <div className="flex items-center gap-1.5 shrink-0 px-2 text-slate-400 text-xs font-black uppercase tracking-widest">
                  <Calendar className="w-4 h-4 text-red-500" />
                  <span>Release Year:</span>
                </div>
                <div className="flex gap-2">
                  {yearFilterOptions.map((f) => {
                    const isActive = moviesYearFilter === f.value;
                    return (
                      <button
                        key={f.value}
                        onClick={() => setMoviesYearFilter(f.value)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer shrink-0 focus:outline-none focus:ring-1 focus:ring-red-650 ${
                          isActive
                            ? 'bg-red-650 border-red-500 text-white shadow-md shadow-red-900/30'
                            : 'bg-zinc-950/60 border-zinc-800 text-slate-400 hover:text-slate-200 hover:border-zinc-700'
                        }`}
                      >
                        {f.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {(() => {
                const isYearActive = !!moviesYearFilter;
                const displayItems = isYearActive ? yearMovies : trendingMovies;
                const isLoading = isYearActive ? loadingYearMovies : loadingCatalog;

                if (isLoading) {
                  return (
                    <div className="flex justify-center items-center py-20">
                      <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  );
                }

                if (displayItems.length === 0) {
                  return (
                    <div className="glass-panel rounded-2xl p-12 border border-slate-800 text-center text-slate-400 mt-6">
                      <Calendar className="w-12 h-12 mx-auto mb-3 text-slate-600 animate-bounce" />
                      <p className="font-semibold text-base text-slate-200">No movies found{isYearActive ? ` from ${yearFilterOptions.find(f => f.value === moviesYearFilter)?.label}` : ''}</p>
                      <p className="text-xs text-slate-500 mt-1.5 max-w-sm mx-auto">Try selecting another year chip or click Load More below to retrieve older titles.</p>
                    </div>
                  );
                }

                return (
                  <MediaGrid
                    items={displayItems}
                    title={isYearActive ? `Popular Movies from ${yearFilterOptions.find(f => f.value === moviesYearFilter)?.label}` : 'Browse Popular Movies'}
                    onSelect={(m) => setSelectedMedia(m)}
                    onLongSelect={(m) => setContextMenuMedia(m)}
                    loading={false}
                  />
                );
              })()}

              {!loadingCatalog && (moviesYearFilter ? yearMovies.length > 0 : trendingMovies.length > 0) && (
                <div className="flex justify-center mt-6 mb-12">
                  <button
                    onClick={handleLoadMoreMovies}
                    disabled={loadingMoreMovies}
                    className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-sm border border-slate-700 hover:border-slate-600 transition-colors shadow-md cursor-pointer"
                  >
                    {loadingMoreMovies ? 'Loading More Movies...' : 'Load More Movies'}
                  </button>
                </div>
              )}
            </div>
          } />

          <Route path="/shows" element={
            <div className="max-w-7xl mx-auto py-4 px-4 lg:px-8 space-y-4">
              {/* Year Filter Row */}
              <div className="flex items-center gap-3 bg-zinc-900/30 border border-zinc-800/80 p-2.5 rounded-2xl overflow-x-auto no-scrollbar">
                <div className="flex items-center gap-1.5 shrink-0 px-2 text-slate-400 text-xs font-black uppercase tracking-widest">
                  <Calendar className="w-4 h-4 text-red-500" />
                  <span>Release Year:</span>
                </div>
                <div className="flex gap-2">
                  {yearFilterOptions.map((f) => {
                    const isActive = showsYearFilter === f.value;
                    return (
                      <button
                        key={f.value}
                        onClick={() => setShowsYearFilter(f.value)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer shrink-0 focus:outline-none focus:ring-1 focus:ring-red-650 ${
                          isActive
                            ? 'bg-red-650 border-red-500 text-white shadow-md shadow-red-900/30'
                            : 'bg-zinc-950/60 border-zinc-800 text-slate-400 hover:text-slate-200 hover:border-zinc-700'
                        }`}
                      >
                        {f.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {(() => {
                const isYearActive = !!showsYearFilter;
                const displayItems = isYearActive ? yearShows : trendingShows;
                const isLoading = isYearActive ? loadingYearShows : loadingCatalog;

                if (isLoading) {
                  return (
                    <div className="flex justify-center items-center py-20">
                      <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  );
                }

                if (displayItems.length === 0) {
                  return (
                    <div className="glass-panel rounded-2xl p-12 border border-slate-800 text-center text-slate-400 mt-6">
                      <Calendar className="w-12 h-12 mx-auto mb-3 text-slate-600 animate-bounce" />
                      <p className="font-semibold text-base text-slate-200">No TV shows found{isYearActive ? ` from ${yearFilterOptions.find(f => f.value === showsYearFilter)?.label}` : ''}</p>
                      <p className="text-xs text-slate-500 mt-1.5 max-w-sm mx-auto">Try selecting another year chip or click Load More below to retrieve older titles.</p>
                    </div>
                  );
                }

                return (
                  <MediaGrid
                    items={displayItems}
                    title={isYearActive ? `Popular TV Shows from ${yearFilterOptions.find(f => f.value === showsYearFilter)?.label}` : 'Browse Popular TV Series'}
                    onSelect={(m) => setSelectedMedia(m)}
                    onLongSelect={(m) => setContextMenuMedia(m)}
                    loading={false}
                  />
                );
              })()}

              {!loadingCatalog && (showsYearFilter ? yearShows.length > 0 : trendingShows.length > 0) && (
                <div className="flex justify-center mt-6 mb-12">
                  <button
                    onClick={handleLoadMoreShows}
                    disabled={loadingMoreShows}
                    className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-sm border border-slate-700 hover:border-slate-600 transition-colors shadow-md cursor-pointer"
                  >
                    {loadingMoreShows ? 'Loading More Shows...' : 'Load More Shows'}
                  </button>
                </div>
              )}
            </div>
          } />

          <Route path="/genres" element={
            <div className="max-w-7xl mx-auto py-4 px-4 lg:px-8 space-y-6">
              {selectedGenre ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setSelectedGenre(null)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span>Back to Genres</span>
                      </button>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-6 bg-red-600 rounded-full" />
                        <h2 className="text-xl lg:text-2xl font-bold tracking-tight text-white animate-in slide-in-from-left duration-200">
                          {selectedGenre.name} <span className="text-xs text-slate-500 font-mono">({selectedGenre.type === 'movie' ? 'Movies' : 'Series'})</span>
                        </h2>
                      </div>
                    </div>
                  </div>

                  <MediaGrid
                    items={genreResults}
                    onSelect={(m) => setSelectedMedia(m)}
                    onLongSelect={(m) => setContextMenuMedia(m)}
                    loading={loadingGenreResults && genreResults.length === 0}
                  />

                  {!loadingGenreResults && genreResults.length > 0 && (
                    <div className="flex justify-center mt-6 mb-12">
                      <button
                        onClick={handleLoadMoreGenreResults}
                        disabled={loadingGenreResults}
                        className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-sm border border-slate-700 hover:border-slate-600 transition-colors shadow-md cursor-pointer"
                      >
                        {loadingGenreResults ? 'Loading More...' : 'Load More'}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-6 bg-red-600 rounded-full" />
                      <h2 className="text-xl lg:text-2xl font-bold tracking-tight text-white">
                        Explore Genres
                      </h2>
                    </div>

                    <div className="flex bg-slate-900/80 p-1 rounded-xl border border-slate-800/80 self-start">
                      <button
                        onClick={() => setGenreTypeTab('movie')}
                        className={`px-4 py-1.5 rounded-lg text-xs font-black tracking-wider uppercase transition-all cursor-pointer ${
                          genreTypeTab === 'movie'
                            ? 'bg-red-650 text-white shadow-md shadow-red-900/20'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        Movies
                      </button>
                      <button
                        onClick={() => setGenreTypeTab('tv')}
                        className={`px-4 py-1.5 rounded-lg text-xs font-black tracking-wider uppercase transition-all cursor-pointer ${
                          genreTypeTab === 'tv'
                            ? 'bg-red-650 text-white shadow-md shadow-red-900/20'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        TV Shows
                      </button>
                    </div>
                  </div>

                  {loadingGenreList ? (
                    <div className="w-full py-20 flex flex-col items-center justify-center">
                      <div className="w-10 h-10 border-4 border-red-650 border-t-transparent rounded-full animate-spin mb-4" />
                      <p className="text-slate-400 font-medium text-sm">Retrieving Genre Catalogs...</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                      {(genreTypeTab === 'movie' ? movieGenres : tvGenres).map((genre) => {
                        const gradient = genreGradients[genre.name] || 'from-slate-700 to-slate-800';
                        const backdropUrl = getGenreBackdrop(genre.id, genreTypeTab);
                        const curated = genreImages[genreTypeTab]?.[genre.id];
                        const posterUrl = curated?.poster ? getImageUrl(curated.poster, 'w92') : '';

                        return (
                          <button
                            key={genre.id}
                            onClick={() => handleSelectGenre({ id: genre.id, name: genre.name, type: genreTypeTab })}
                            className={`relative aspect-video rounded-2xl bg-gradient-to-tr ${gradient} p-3 sm:p-4 flex items-center gap-3 text-left border border-white/5 shadow-md hover:shadow-lg hover:scale-105 focus:scale-105 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer overflow-hidden group`}
                          >
                            {backdropUrl && (
                              <img
                                src={backdropUrl}
                                alt=""
                                loading="lazy"
                                className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:scale-110 group-hover:opacity-30 transition-all duration-500"
                              />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/40 to-transparent group-hover:from-slate-950/95 transition-all duration-300" />
                            <div className="absolute -right-6 -top-6 w-16 h-16 rounded-full bg-white/5 blur-xl group-hover:bg-white/10 transition-colors" />

                            {posterUrl && (
                              <div className="relative z-10 w-9 sm:w-11 aspect-[2/3] rounded-lg overflow-hidden border border-white/10 shadow-lg shrink-0 group-hover:scale-105 transition-transform duration-300">
                                <img
                                  src={posterUrl}
                                  alt=""
                                  loading="lazy"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}

                            <span className="relative z-10 text-slate-100 font-extrabold text-xs sm:text-sm md:text-base tracking-tight leading-tight group-hover:text-white transition-colors line-clamp-2">
                              {genre.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          } />

          <Route path="/collections" element={
            <HydraCollections
              onSelectMedia={(m) => setSelectedMedia(m)}
              onLongSelectMedia={(m) => setContextMenuMedia(m)}
            />
          } />

          <Route path="/collections/:collectionId" element={
            <HydraCollections
              onSelectMedia={(m) => setSelectedMedia(m)}
              onLongSelectMedia={(m) => setContextMenuMedia(m)}
            />
          } />

          <Route path="/search" element={
            <div className="max-w-7xl mx-auto py-4 px-4 lg:px-8 space-y-4">
              <div className="mb-2">
                <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">
                  Search Results for
                </p>
                <h2 className="text-xl lg:text-2xl font-black text-white">
                  "{searchQuery}"
                </h2>
              </div>

              {/* Year Filter Row */}
              <div className="flex items-center gap-3 bg-zinc-900/30 border border-zinc-800/80 p-2.5 rounded-2xl overflow-x-auto no-scrollbar">
                <div className="flex items-center gap-1.5 shrink-0 px-2 text-slate-400 text-xs font-black uppercase tracking-widest">
                  <Calendar className="w-4 h-4 text-red-500" />
                  <span>Release Year:</span>
                </div>
                <div className="flex gap-2">
                  {yearFilterOptions.map((f) => {
                    const isActive = searchYearFilter === f.value;
                    return (
                      <button
                        key={f.value}
                        onClick={() => setSearchYearFilter(f.value)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer shrink-0 focus:outline-none focus:ring-1 focus:ring-red-650 ${
                          isActive
                            ? 'bg-red-600 border-red-500 text-white shadow-md shadow-red-900/30'
                            : 'bg-zinc-950/60 border-zinc-800 text-slate-400 hover:text-slate-200 hover:border-zinc-700'
                        }`}
                      >
                        {f.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {filterMediaByYear(searchResults, searchYearFilter).length === 0 && !loadingCatalog ? (
                <div className="glass-panel rounded-2xl p-12 border border-slate-800 text-center text-slate-400 mt-6">
                  <Calendar className="w-12 h-12 mx-auto mb-3 text-slate-600 animate-bounce" />
                  <p className="font-semibold text-base text-slate-200">No results found from {yearFilterOptions.find(f => f.value === searchYearFilter)?.label}</p>
                  <p className="text-xs text-slate-500 mt-1.5 max-w-sm mx-auto">Try selecting another year chip or search for another query.</p>
                </div>
              ) : (
                <MediaGrid
                  items={filterMediaByYear(searchResults, searchYearFilter)}
                  onSelect={(m) => setSelectedMedia(m)}
                  onLongSelect={(m) => setContextMenuMedia(m)}
                  loading={loadingCatalog}
                />
              )}
            </div>
          } />

          <Route path="/scraper" element={
            <ScraperConsole
              initialQueryType={scraperConfig.queryType}
              initialQueryId={scraperConfig.queryId}
              initialTitle={scraperConfig.titleContext}
              settings={settings}
              onLaunchStream={handleLaunchStream}
              onBack={() => setCurrentTab('home')}
            />
          } />

          <Route path="/settings" element={
            <SettingsModal
              settings={settings}
              onSaveSettings={handleSaveSettings}
            />
          } />

          <Route path="/watchlist" element={
            <div className="max-w-7xl mx-auto py-4 px-4 lg:px-8 space-y-8">
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-1.5 h-6 bg-red-600 rounded-full" />
                  <h2 className="text-xl lg:text-2xl font-bold tracking-tight text-white">
                    My Watchlist
                  </h2>
                </div>
                {watchlist.length === 0 ? (
                  <div className="glass-panel rounded-2xl p-8 border border-slate-800 text-center text-slate-400">
                    <Bookmark className="w-10 h-10 mx-auto mb-2 text-slate-600" />
                    <p className="font-semibold text-sm">Your Watchlist is empty.</p>
                    <p className="text-xs text-slate-500 mt-1">Tap the heart icon on any movie or TV show to save it here.</p>
                  </div>
                ) : (
                  <MediaGrid
                    items={watchlist}
                    onSelect={(m) => setSelectedMedia(m)}
                    onLongSelect={(m) => setContextMenuMedia(m)}
                  />
                )}
              </div>

              <div>
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-6 bg-red-600 rounded-full" />
                    <h2 className="text-xl lg:text-2xl font-bold tracking-tight text-white">
                      Watch History
                    </h2>
                  </div>
                  {history.length > 0 && (
                    <button
                      onClick={() => setHistory(clearHistory())}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-red-650/20 text-slate-400 hover:text-red-400 text-xs font-semibold border border-slate-800 hover:border-red-900/40 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Clear History</span>
                    </button>
                  )}
                </div>

                {history.length === 0 ? (
                  <div className="glass-panel rounded-2xl p-8 border border-slate-800 text-center text-slate-400">
                    <Clock className="w-10 h-10 mx-auto mb-2 text-slate-600" />
                    <p className="font-semibold text-sm">No watch history found.</p>
                    <p className="text-xs text-slate-500 mt-1">Streams you launch will be logged here for quick access.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {history.map((item) => {
                      const isMovie = item.season === undefined;
                      const dateStr = new Date(item.timestamp).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      });
                      
                      return (
                        <div 
                          key={item.id} 
                          className="glass-panel rounded-xl p-4 border border-slate-800 flex items-center justify-between gap-4 hover:border-slate-700 transition-colors"
                        >
                          <div className="flex items-center gap-3 overflow-hidden">
                            {item.media.poster_path ? (
                              <img 
                                src={getImageUrl(item.media.poster_path, 'w92')} 
                                alt={item.media.title || item.media.name} 
                                className="w-10 h-15 rounded object-cover border border-slate-800 shrink-0" 
                              />
                            ) : (
                              <div className="w-10 h-15 rounded bg-slate-900 flex items-center justify-center shrink-0 border border-slate-800 text-slate-700">
                                <Film className="w-5 h-5 text-slate-500" />
                              </div>
                            )}

                            <div className="overflow-hidden">
                              <h4 
                                onClick={() => setSelectedMedia(item.media)}
                                className="text-slate-200 font-bold text-xs sm:text-sm hover:text-red-500 transition-colors cursor-pointer truncate"
                              >
                                {item.media.title || item.media.name}
                              </h4>
                              <p className="text-red-400 font-medium text-[11px] mt-0.5">
                                {isMovie ? 'Movie' : `S${item.season}E${item.episode}`}
                              </p>
                              <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500">
                                <span className="bg-slate-900 px-1 py-0.2 rounded border border-slate-800">{item.stream.resolution}</span>
                                <span>{item.stream.provider}</span>
                                <span>•</span>
                                <span>{dateStr}</span>
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              setSelectedMedia(item.media);
                            }}
                            className="p-2 bg-slate-900 hover:bg-slate-805 text-slate-300 rounded-lg border border-slate-800 transition-colors cursor-pointer"
                            title="Open Details"
                          >
                            <Play className="w-3.5 h-3.5 fill-current text-slate-400" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          } />

          {/* Wildcard redirect back to /home */}
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </main>

      {/* Media Details Modal */}
      {selectedMedia && (
        <MediaDetailModal
          media={selectedMedia}
          onClose={() => setSelectedMedia(null)}
          onStartScraping={handleStartScraping}
          watchlist={watchlist}
          onToggleWatchlist={handleToggleWatchlist}
          continueWatching={continueWatching}
          onClearProgress={handleClearProgress}
          onResumePlayback={(item, queryId, titleContext) => {
            setActiveScrapedMedia({
              media: item.media,
              season: item.season,
              episode: item.episode
            });
            setSelectedMedia(null);
            setScraperConfig({
              queryType: item.season !== undefined ? 'series' : 'movie',
              queryId,
              titleContext
            });
            setCurrentTab('scraper');
          }}
          onSelectPerson={(personId, personName) => {
            setSelectedMedia(null);
            setSelectedPerson({ id: personId, name: personName });
          }}
        />
      )}

      {/* Person Details Modal */}
      {selectedPerson && (
        <PersonDetailModal
          personId={selectedPerson.id}
          personName={selectedPerson.name}
          onClose={() => setSelectedPerson(null)}
          onSelectMedia={(m) => {
            setSelectedPerson(null);
            setSelectedMedia(m);
          }}
          onLongSelectMedia={(m) => {
            setContextMenuMedia(m);
          }}
        />
      )}

      {/* Poster Context Menu Overlay */}
      {contextMenuMedia && (
        <PosterContextMenuModal
          media={contextMenuMedia}
          isAddedToWatchlist={watchlist.some(item => item.id === contextMenuMedia.id)}
          isMarkedAsWatched={history.some(item => item.media.id === contextMenuMedia.id)}
          onToggleWatchlist={() => handleToggleWatchlist(contextMenuMedia)}
          onToggleWatched={() => handleToggleWatched(contextMenuMedia)}
          onViewDetails={() => {
            setSelectedPerson(null); // Ensure person modal closes if we jump
            setSelectedMedia(contextMenuMedia);
          }}
          onClose={() => setContextMenuMedia(null)}
        />
      )}

      {/* HTML5 Video Player Overlay */}
      {activeStream && (
        <VideoPlayer
          stream={activeStream}
          onClose={handleClosePlayer}
          initialTime={getActiveProgressTime()}
          targetPackage={settings.targetIntentPackage}
          onSwitchStream={() => {
            handleClosePlayer(); // Save progress on switch
            setCurrentTab('scraper');
          }}
        />
      )}

      {/* PWA Install Slide-Up Toast Notification */}
      {showInstallToast && !installToastDismissed && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-[#0e1420]/95 border border-slate-800 rounded-2xl p-5 shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-10 slide-in-from-right-10 duration-500">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center shrink-0 shadow-lg shadow-red-650/20">
              <Download className="w-5 h-5 text-white" />
            </div>
            <div className="flex-grow space-y-1">
              <h4 className="text-slate-200 font-black text-sm">Install LeeStreamTVPro</h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                Add to your home screen for standalone playback, speedier scraping, and offline watchlist access.
              </p>
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={handleInstallPWA}
                  className="px-3 py-1.5 bg-red-650 hover:bg-red-600 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer focus:outline-none focus:ring-1 focus:ring-red-500"
                >
                  Install Now
                </button>
                <button
                  onClick={handleDismissInstallToast}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 font-bold rounded-lg text-xs transition-colors cursor-pointer border border-slate-800 focus:outline-none focus:border-red-500"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global Footer */}
      <footer className="border-t border-slate-900 bg-[#070a0f] py-8 px-4 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-red-600/20 flex items-center justify-center">
              <Radio className="w-3.5 h-3.5 text-red-500 animate-pulse" />
            </div>
            <span className="font-bold text-slate-300">LeeStreamTVPro v1.0</span>
            <span>— Premium Streaming & Scraping Engine</span>
          </div>

          {/* System Environment badges */}
          <div className="flex flex-wrap items-center gap-4">
            
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>TMDb Indexer V3</span>
            </span>

            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>4 Target Endpoints</span>
            </span>

            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-500" />
              <span>CORS Fallback Proxy</span>
            </span>



            <span className="text-slate-600">
              Made with <Heart className="w-3 h-3 text-red-500 inline fill-current" /> for Android & Web
            </span>

          </div>

        </div>
      </footer>

    </div>
  );
}
