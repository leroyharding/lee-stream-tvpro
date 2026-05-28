import { TMDbMedia } from '../types';
import { TMDB_BASE_URL, TMDB_API_KEY } from './tmdb';

export interface HydraCollection {
  id: string;
  title: string;
  emoji: string;
  type: 'tmdb_collection' | 'discover_movie' | 'discover_tv' | 'person_movies';
  discoverParams?: string;
  tmdbCollectionId?: number;
  personId?: number;
}

export const curatedCollections: HydraCollection[] = [
  { "id": "star-wars", "title": "Star Wars Saga", "emoji": "⚔️", "type": "tmdb_collection", "tmdbCollectionId": 10 },
  { "id": "mcu", "title": "Marvel Cinematic Universe", "emoji": "🦸", "type": "discover_movie", "discoverParams": "&with_keywords=180547&sort_by=release_date.asc" },
  { "id": "dc", "title": "DC Universe Films", "emoji": "🦇", "type": "discover_movie", "discoverParams": "&with_keywords=349&sort_by=release_date.asc" },
  { "id": "james-bond", "title": "James Bond 007", "emoji": "🔫", "type": "tmdb_collection", "tmdbCollectionId": 645 },
  { "id": "harry-potter", "title": "Harry Potter Collection", "emoji": "🧙", "type": "tmdb_collection", "tmdbCollectionId": 1241 },
  { "id": "lord-of-rings", "title": "Lord of the Rings", "emoji": "💍", "type": "tmdb_collection", "tmdbCollectionId": 119 },
  { "id": "hobbit", "title": "The Hobbit Trilogy", "emoji": "🧝", "type": "tmdb_collection", "tmdbCollectionId": 121938 },
  { "id": "fast-furious", "title": "Fast & Furious", "emoji": "🚗", "type": "tmdb_collection", "tmdbCollectionId": 9485 },
  { "id": "mission-impossible", "title": "Mission: Impossible", "emoji": "💣", "type": "tmdb_collection", "tmdbCollectionId": 87359 },
  { "id": "john-wick", "title": "John Wick Saga", "emoji": "🐶", "type": "tmdb_collection", "tmdbCollectionId": 404609 },
  { "id": "matrix", "title": "The Matrix Saga", "emoji": "🕶️", "type": "tmdb_collection", "tmdbCollectionId": 2344 },
  { "id": "jurassic-park", "title": "Jurassic Park", "emoji": "🦕", "type": "tmdb_collection", "tmdbCollectionId": 328 },
  { "id": "pirates-caribbean", "title": "Pirates of the Caribbean", "emoji": "🏴‍☠️", "type": "tmdb_collection", "tmdbCollectionId": 295 },
  { "id": "indiana-jones", "title": "Indiana Jones Collection", "emoji": "🎩", "type": "tmdb_collection", "tmdbCollectionId": 84 },
  { "id": "back-to-future", "title": "Back to the Future", "emoji": "⚡", "type": "tmdb_collection", "tmdbCollectionId": 264 },
  { "id": "terminator", "title": "Terminator Anthology", "emoji": "🤖", "type": "tmdb_collection", "tmdbCollectionId": 534 },
  { "id": "alien", "title": "Alien Saga", "emoji": "👾", "type": "tmdb_collection", "tmdbCollectionId": 8091 },
  { "id": "predator", "title": "Predator Franchise", "emoji": "🌿", "type": "tmdb_collection", "tmdbCollectionId": 399 },
  { "id": "rocky", "title": "Rocky & Creed", "emoji": "🥊", "type": "tmdb_collection", "tmdbCollectionId": 1575 },
  { "id": "nolan", "title": "Christopher Nolan Films", "emoji": "🎞️", "type": "person_movies", "personId": 525 },
  { "id": "tarantino", "title": "Quentin Tarantino Films", "emoji": "🩸", "type": "person_movies", "personId": 138 },
  { "id": "scorsese", "title": "Martin Scorsese Films", "emoji": "🎬", "type": "person_movies", "personId": 1032 },
  { "id": "oscar-winners", "title": "Oscar Best Pictures", "emoji": "🏆", "type": "discover_movie", "discoverParams": "&with_keywords=10704&sort_by=vote_average.desc&vote_count.gte=500" },
  { "id": "top-tv", "title": "Top Rated TV Series", "emoji": "📺", "type": "discover_tv", "discoverParams": "&sort_by=vote_average.desc&vote_count.gte=1000" }
];

const apiKey = TMDB_API_KEY;

export async function fetchCollectionItems(collection: HydraCollection): Promise<TMDbMedia[]> {
  let url = '';
  switch (collection.type) {
    case 'tmdb_collection':
      url = `${TMDB_BASE_URL}/collection/${collection.tmdbCollectionId}?api_key=${apiKey}`;
      const colRes = await fetch(url);
      if (!colRes.ok) throw new Error(`Failed to fetch collection: ${collection.title}`);
      const colData = await colRes.json();
      return (colData.parts || []).map((item: any) => ({
        ...item,
        media_type: 'movie'
      }));

    case 'discover_movie':
      url = `${TMDB_BASE_URL}/discover/movie?api_key=${apiKey}${collection.discoverParams || ''}`;
      const dmRes = await fetch(url);
      if (!dmRes.ok) throw new Error(`Failed to discover movie: ${collection.title}`);
      const dmData = await dmRes.json();
      return (dmData.results || []).map((item: any) => ({
        ...item,
        media_type: 'movie'
      }));

    case 'discover_tv':
      url = `${TMDB_BASE_URL}/discover/tv?api_key=${apiKey}${collection.discoverParams || ''}`;
      const dtRes = await fetch(url);
      if (!dtRes.ok) throw new Error(`Failed to discover TV: ${collection.title}`);
      const dtData = await dtRes.json();
      return (dtData.results || []).map((item: any) => ({
        ...item,
        media_type: 'tv'
      }));

    case 'person_movies':
      url = `${TMDB_BASE_URL}/person/${collection.personId}/movie_credits?api_key=${apiKey}`;
      const pRes = await fetch(url);
      if (!pRes.ok) throw new Error(`Failed to fetch person credits: ${collection.title}`);
      const pData = await pRes.json();
      const directed = (pData.crew || [])
        .filter((item: any) => item.job === 'Director')
        .sort((a: any, b: any) => {
          // Sort directed movies by popularity or release date
          return (b.popularity || 0) - (a.popularity || 0);
        });
      return directed.map((item: any) => ({
        ...item,
        media_type: 'movie'
      }));

    default:
      return [];
  }
}
