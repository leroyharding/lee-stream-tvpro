import { TMDbMedia, TMDbMediaDetail, TMDbEpisode, TMDbPersonDetail } from '../types';

export const TMDB_API_KEY = '8711e2c6b0504a3277a840e1dde5ed86';
export const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

export interface TMDbResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export async function getTrendingMovies(page = 1): Promise<TMDbResponse<TMDbMedia>> {
  const res = await fetch(`${TMDB_BASE_URL}/trending/movie/week?api_key=${TMDB_API_KEY}&page=${page}`);
  if (!res.ok) throw new Error('Failed to fetch trending movies');
  const data = await res.json();
  // Tag explicitly as movie
  data.results = data.results.map((item: any) => ({ ...item, media_type: 'movie' }));
  return data;
}

export async function getTrendingShows(page = 1): Promise<TMDbResponse<TMDbMedia>> {
  const res = await fetch(`${TMDB_BASE_URL}/trending/tv/week?api_key=${TMDB_API_KEY}&page=${page}`);
  if (!res.ok) throw new Error('Failed to fetch trending TV shows');
  const data = await res.json();
  // Tag explicitly as tv
  data.results = data.results.map((item: any) => ({ ...item, media_type: 'tv' }));
  return data;
}

export async function searchMulti(query: string, page = 1): Promise<TMDbResponse<TMDbMedia>> {
  const res = await fetch(
    `${TMDB_BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=${page}`
  );
  if (!res.ok) throw new Error('Failed to search catalog');
  const data = await res.json();
  // Filter out people
  data.results = data.results.filter((item: any) => item.media_type === 'movie' || item.media_type === 'tv');
  return data;
}

export async function getMediaDetails(id: number, type: 'movie' | 'tv'): Promise<TMDbMediaDetail> {
  const res = await fetch(`${TMDB_BASE_URL}/${type}/${id}?api_key=${TMDB_API_KEY}&append_to_response=credits,videos`);
  if (!res.ok) throw new Error(`Failed to fetch ${type} details`);
  const data = await res.json();
  return {
    ...data,
    media_type: type
  };
}

export async function getSeasonDetails(tmdbId: number, seasonNumber: number): Promise<{ episodes: TMDbEpisode[] }> {
  const res = await fetch(`${TMDB_BASE_URL}/tv/${tmdbId}/season/${seasonNumber}?api_key=${TMDB_API_KEY}`);
  if (!res.ok) throw new Error(`Failed to fetch season ${seasonNumber} details`);
  return await res.json();
}

export async function getExternalIds(tmdbId: number, type: 'movie' | 'tv'): Promise<{ imdb_id?: string }> {
  const res = await fetch(`${TMDB_BASE_URL}/${type}/${tmdbId}/external_ids?api_key=${TMDB_API_KEY}`);
  if (!res.ok) throw new Error(`Failed to fetch external IDs for ${type} ${tmdbId}`);
  return await res.json();
}

export function getImageUrl(path?: string, size: string = 'w500'): string {
  if (!path) return '';
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

export async function getPersonDetails(personId: number): Promise<TMDbPersonDetail> {
  const res = await fetch(`${TMDB_BASE_URL}/person/${personId}?api_key=${TMDB_API_KEY}`);
  if (!res.ok) throw new Error(`Failed to fetch person details for ID ${personId}`);
  return await res.json();
}

export async function getPersonCredits(personId: number): Promise<{ cast: TMDbMedia[] }> {
  const res = await fetch(`${TMDB_BASE_URL}/person/${personId}/combined_credits?api_key=${TMDB_API_KEY}`);
  if (!res.ok) throw new Error(`Failed to fetch credits for person ID ${personId}`);
  const data = await res.json();
  
  // Combine both cast and crew roles to cover actors, directors, writers, etc.
  const cast = data.cast || [];
  const crew = data.crew || [];
  const combined = [...cast, ...crew];

  // De-duplicate items by combined unique key of id and media_type
  const uniqueMap = new Map<string, any>();
  for (const item of combined) {
    const key = `${item.id}-${item.media_type}`;
    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, item);
    } else {
      // If duplicate, prioritize the item with poster_path if the existing one lacks it
      const existing = uniqueMap.get(key);
      if (!existing.poster_path && item.poster_path) {
        uniqueMap.set(key, item);
      }
    }
  }

  const uniqueList = Array.from(uniqueMap.values())
    .filter((c: any) => c.poster_path)
    .sort((a: any, b: any) => (b.popularity || 0) - (a.popularity || 0));

  return { cast: uniqueList };
}

export async function getGenres(type: 'movie' | 'tv'): Promise<{ id: number; name: string }[]> {
  const res = await fetch(`${TMDB_BASE_URL}/genre/${type}/list?api_key=${TMDB_API_KEY}`);
  if (!res.ok) throw new Error(`Failed to fetch ${type} genres`);
  const data = await res.json();
  return data.genres || [];
}

export async function discoverByGenre(
  type: 'movie' | 'tv',
  genreId: number,
  page = 1
): Promise<TMDbResponse<TMDbMedia>> {
  const res = await fetch(
    `${TMDB_BASE_URL}/discover/${type}?api_key=${TMDB_API_KEY}&with_genres=${genreId}&page=${page}&sort_by=popularity.desc`
  );
  if (!res.ok) throw new Error(`Failed to discover ${type} by genre ${genreId}`);
  const data = await res.json();
  data.results = (data.results || []).map((item: any) => ({ ...item, media_type: type }));
  return data;
}

// Year-based discovery using /discover endpoint for fetching popular movies/shows from a specific year
export async function discoverMoviesByYear(year: string, page = 1): Promise<TMDbResponse<TMDbMedia>> {
  let yearParams = '';
  if (year.endsWith('s')) {
    // Decade: e.g. "2010s" -> 2010-2019
    const decadeStart = parseInt(year);
    yearParams = `&primary_release_date.gte=${decadeStart}-01-01&primary_release_date.lte=${decadeStart + 9}-12-31`;
  } else if (year === 'older') {
    yearParams = `&primary_release_date.lte=1999-12-31`;
  } else {
    yearParams = `&primary_release_year=${year}`;
  }
  const res = await fetch(
    `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&sort_by=popularity.desc&page=${page}${yearParams}`
  );
  if (!res.ok) throw new Error(`Failed to discover movies for year ${year}`);
  const data = await res.json();
  data.results = (data.results || []).map((item: any) => ({ ...item, media_type: 'movie' }));
  return data;
}

export async function discoverShowsByYear(year: string, page = 1): Promise<TMDbResponse<TMDbMedia>> {
  let yearParams = '';
  if (year.endsWith('s')) {
    const decadeStart = parseInt(year);
    yearParams = `&first_air_date.gte=${decadeStart}-01-01&first_air_date.lte=${decadeStart + 9}-12-31`;
  } else if (year === 'older') {
    yearParams = `&first_air_date.lte=1999-12-31`;
  } else {
    yearParams = `&first_air_date_year=${year}`;
  }
  const res = await fetch(
    `${TMDB_BASE_URL}/discover/tv?api_key=${TMDB_API_KEY}&sort_by=popularity.desc&page=${page}${yearParams}`
  );
  if (!res.ok) throw new Error(`Failed to discover shows for year ${year}`);
  const data = await res.json();
  data.results = (data.results || []).map((item: any) => ({ ...item, media_type: 'tv' }));
  return data;
}

