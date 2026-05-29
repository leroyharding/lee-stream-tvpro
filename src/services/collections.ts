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
  posterPath?: string;
}

export const curatedCollections: HydraCollection[] = [
  { "id": "star-wars", "title": "Star Wars Saga", "emoji": "⚔️", "type": "tmdb_collection", "tmdbCollectionId": 10, "posterPath": "/pWVLFh4OuejTpUaDQbB1C4zoS2p.jpg" },
  { "id": "mcu", "title": "Marvel Cinematic Universe", "emoji": "🦸", "type": "discover_movie", "discoverParams": "&with_keywords=180547&sort_by=release_date.asc", "posterPath": "/78lPtwv72eTNqFW9COBYI0dWDJa.jpg" },
  { "id": "dc", "title": "DC Universe Films", "emoji": "🦇", "type": "discover_movie", "discoverParams": "&with_keywords=349&sort_by=release_date.asc", "posterPath": "/cB46TSg3kGjq2eVy5kVUhlpUa1H.jpg" },
  { "id": "james-bond", "title": "James Bond 007", "emoji": "🔫", "type": "tmdb_collection", "tmdbCollectionId": 645, "posterPath": "/ofwSiqOFShhunAIYYdSMHMJQSx2.jpg" },
  { "id": "harry-potter", "title": "Harry Potter Collection", "emoji": "🧙", "type": "tmdb_collection", "tmdbCollectionId": 1241, "posterPath": "/eVPs2Y0LyvTLZn6AP5Z6O2rtiGB.jpg" },
  { "id": "lord-of-rings", "title": "Lord of the Rings", "emoji": "💍", "type": "tmdb_collection", "tmdbCollectionId": 119, "posterPath": "/oENY593nKRVL2PnxXsMtlh8izb4.jpg" },
  { "id": "hobbit", "title": "The Hobbit Trilogy", "emoji": "🧝", "type": "tmdb_collection", "tmdbCollectionId": 121938, "posterPath": "/hQghXOjSS2xfzx9XnMyZqt8brCF.jpg" },
  { "id": "fast-furious", "title": "Fast & Furious", "emoji": "🚗", "type": "tmdb_collection", "tmdbCollectionId": 9485, "posterPath": "/zOCnMPoUxgJK1RFPfN4PcnT16gr.jpg" },
  { "id": "mission-impossible", "title": "Mission: Impossible", "emoji": "💣", "type": "tmdb_collection", "tmdbCollectionId": 87359, "posterPath": "/geEjCGfdmRAA1skBPwojcdvnZ8A.jpg" },
  { "id": "john-wick", "title": "John Wick Saga", "emoji": "🐶", "type": "tmdb_collection", "tmdbCollectionId": 404609, "posterPath": "/sm7rZZivZm2NhJDucFf3gpfFdVt.jpg" },
  { "id": "matrix", "title": "The Matrix Saga", "emoji": "🕶️", "type": "tmdb_collection", "tmdbCollectionId": 2344, "posterPath": "/bV9qTVHTVf0gkW0j7p7M0ILD4pG.jpg" },
  { "id": "jurassic-park", "title": "Jurassic Park", "emoji": "🦕", "type": "tmdb_collection", "tmdbCollectionId": 328, "posterPath": "/qIm2nHXLpBBdMxi8dvfrnDkBUDh.jpg" },
  { "id": "pirates-caribbean", "title": "Pirates of the Caribbean", "emoji": "🏴‍☠️", "type": "tmdb_collection", "tmdbCollectionId": 295, "posterPath": "/zRBaZxS5YauLvRYjAdL4AUCwlht.jpg" },
  { "id": "indiana-jones", "title": "Indiana Jones Collection", "emoji": "🎩", "type": "tmdb_collection", "tmdbCollectionId": 84, "posterPath": "/lpxDrACKJhbbGOlwVMNz5YCj6SI.jpg" },
  { "id": "back-to-future", "title": "Back to the Future", "emoji": "⚡", "type": "tmdb_collection", "tmdbCollectionId": 264, "posterPath": "/5Xsu2o5IsZRuuxCEVZ9nVve21FP.jpg" },
  { "id": "terminator", "title": "Terminator Anthology", "emoji": "🤖", "type": "tmdb_collection", "tmdbCollectionId": 534, "posterPath": "/kpZxdNsAV7qTdTLwKM5NLqa7GEo.jpg" },
  { "id": "alien", "title": "Alien Saga", "emoji": "👾", "type": "tmdb_collection", "tmdbCollectionId": 8091, "posterPath": "/gWFHIY77cRVoBRGERwMHqpD27gc.jpg" },
  { "id": "predator", "title": "Predator Franchise", "emoji": "🌿", "type": "tmdb_collection", "tmdbCollectionId": 399, "posterPath": "/mm2t5dd1QFxtX6X56Z9U5ucsIb1.jpg" },
  { "id": "rocky", "title": "Rocky & Creed", "emoji": "🥊", "type": "tmdb_collection", "tmdbCollectionId": 1575, "posterPath": "/fKe9y1AJHEzoiHwSrjfwyinuCE8.jpg" },
  { "id": "nolan", "title": "Christopher Nolan Films", "emoji": "🎞️", "type": "person_movies", "personId": 525, "posterPath": "/e15wNHmLX7PJUo8lqzQRhwbX7PL.jpg" },
  { "id": "tarantino", "title": "Quentin Tarantino Films", "emoji": "🩸", "type": "person_movies", "personId": 138, "posterPath": "/75aHn1NOYXh4M7L5shoeQ6NGykP.jpg" },
  { "id": "scorsese", "title": "Martin Scorsese Films", "emoji": "🎬", "type": "person_movies", "personId": 1032, "posterPath": "/7LOEQFDoGDHQX5Uta8C9X2a3gR4.jpg" },
  { "id": "oscar-winners", "title": "Oscar Best Pictures", "emoji": "🏆", "type": "discover_movie", "discoverParams": "&with_keywords=10704&sort_by=vote_average.desc&vote_count.gte=500", "posterPath": "/v7TaX8kXMXs5yFFGR41guUDNcnB.jpg" },
  { "id": "top-tv", "title": "Top Rated TV Series", "emoji": "📺", "type": "discover_tv", "discoverParams": "&sort_by=vote_average.desc&vote_count.gte=1000", "posterPath": "/ztkUQFLlC19CCMYHW9o1zWhJRNq.jpg" }
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
