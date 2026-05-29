import { StreamLink, StreamProvider, StreamCategory, AppSettings } from '../types';

// Robust CORS Proxy Fetcher Chain
async function corsFetch(url: string): Promise<any> {
  // 1. First attempt: Direct request
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    // Direct attempt failed due to CORS or timeout, continue to proxies
  }

  // 2. Second attempt: AllOrigins
  try {
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(10000) });
    if (res.ok) {
      const data = await res.json();
      if (data && data.contents) {
        return JSON.parse(data.contents);
      }
    }
  } catch (err) {
    // Continue to next proxy
  }

  // 3. Third attempt: CodeTabs Proxy
  try {
    const proxyUrl = `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`;
    const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(10000) });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    // Last fallback
  }

  // 4. Fourth attempt: Corsproxy.io
  const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
  const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(10000) });
  if (!res.ok) {
    throw new Error(`All proxy endpoints failed to retrieve stream data for ${url}`);
  }
  return await res.json();
}

// Resolution classification helper
function parseResolution(text: string): string {
  const upper = text.toUpperCase();
  if (upper.includes('4K') || upper.includes('2160')) return '4K';
  if (upper.includes('1080')) return '1080p';
  if (upper.includes('720')) return '720p';
  return 'Other';
}

// Weights computation as defined by system spec
function calculateWeights(category: StreamCategory, resolution: string): { categoryWeight: number; resolutionWeight: number; totalWeight: number } {
  const catWeight = category === 'hd' ? 2 : 1;
  
  let resWeight = -2;
  if (resolution === '4K') {
    resWeight = category === 'hd' ? 6 : 5;
  } else if (resolution === '1080p') {
    resWeight = category === 'hd' ? 3 : 2;
  } else if (resolution === '720p') {
    resWeight = category === 'hd' ? 0 : -1;
  }

  return {
    categoryWeight: catWeight,
    resolutionWeight: resWeight,
    totalWeight: catWeight * 10 + resWeight // ensure primary sorting order honors both
  };
}

// Thread Targets

// 1. Torrentio
export async function scrapeTorrentio(
  queryType: 'movie' | 'series',
  queryId: string,
  settings: AppSettings
): Promise<StreamLink[]> {
  const config = settings.torrentioConfig;
  const url = `https://torrentio.strem.fun/${config}/stream/${queryType}/${queryId}.json`;
  const data = await corsFetch(url);
  const streams: StreamLink[] = [];

  if (data && Array.isArray(data.streams)) {
    data.streams.forEach((st: any, idx: number) => {
      const name = st.name || '';
      const title = st.title || '';
      
      const resolution = parseResolution(name + ' ' + title);
      
      // Extract size
      const sizeMatch = title.match(/💾\s*([\d\.]+\s*(?:GB|MB))/i);
      const size = sizeMatch ? sizeMatch[1] : undefined;

      // Extract seeds
      const seedMatch = title.match(/👤\s*(\d+)/);
      const seeds = seedMatch ? parseInt(seedMatch[1], 10) : undefined;

      // Category assignment
      const isHighRes = resolution === '4K' || resolution === '1080p';
      const category: StreamCategory = isHighRes ? 'hd' : 'free';

      const weights = calculateWeights(category, resolution);

      // Extract clean title from description or fallback
      const cleanTitle = title.split('\n')[0] || name;

      // Construct stream link
      // If it has a direct url, use it. Otherwise use the infoHash or magnet
      const streamUrl = st.url || (st.infoHash ? `magnet:?xt=urn:btih:${st.infoHash}` : '');

      if (streamUrl) {
        streams.push({
          id: `torrentio-${idx}-${st.infoHash || idx}`,
          provider: 'Torrentio',
          category,
          resolution,
          title: cleanTitle,
          url: streamUrl,
          size,
          seeds,
          isPremium: false,
          ...weights,
          originalData: st
        });
      }
    });
  }

  return streams;
}

// 2. NoTorrent
export async function scrapeNoTorrent(
  queryType: 'movie' | 'series',
  queryId: string
): Promise<StreamLink[]> {
  const url = `https://addon.notorrent2.workers.dev/stream/${queryType}/${queryId}.json`;
  const data = await corsFetch(url);
  const streams: StreamLink[] = [];

  if (data && Array.isArray(data.streams)) {
    data.streams.forEach((st: any, idx: number) => {
      const streamUrl = st.url || '';
      
      // Exclude archives
      const lowerUrl = streamUrl.toLowerCase();
      if (lowerUrl.includes('.zip') || lowerUrl.includes('.rar')) return;

      // Include only streams having HLS or HTTP URLs
      if (!lowerUrl.startsWith('http')) return;

      const title = st.title || st.name || '';
      const resolution = parseResolution(title);

      // Category assignment
      const isHighRes = resolution === '4K' || resolution === '1080p';
      const category: StreamCategory = isHighRes ? 'hd' : 'free';

      const weights = calculateWeights(category, resolution);

      streams.push({
        id: `notorrent-${idx}`,
        provider: 'NoTorrent',
        category,
        resolution,
        title: title.split('\n')[0] || 'Direct HTTP Stream',
        url: streamUrl,
        isPremium: false,
        ...weights,
        originalData: st
      });
    });
  }

  return streams;
}

// 3. StreamViX
export async function scrapeStreamViX(
  queryType: 'movie' | 'series',
  queryId: string,
  settings: AppSettings
): Promise<StreamLink[]> {
  const vixConfig = settings.streamVixConfig;
  const url = `https://streamvix.hayd.uk/${vixConfig}/stream/${queryType}/${queryId}.json`;
  const data = await corsFetch(url);
  const streams: StreamLink[] = [];

  if (data && Array.isArray(data.streams)) {
    data.streams.forEach((st: any, idx: number) => {
      const streamUrl = st.url || '';
      const lowerUrl = streamUrl.toLowerCase();

      // Filtering: Exclude URLs containing hubcloud, login.php, .zip, or .rar
      if (
        lowerUrl.includes('hubcloud') ||
        lowerUrl.includes('login.php') ||
        lowerUrl.includes('.zip') ||
        lowerUrl.includes('.rar')
      ) {
        return;
      }

      const title = st.title || st.name || '';
      const resolution = parseResolution(title);

      // Assume standard direct high quality
      const category: StreamCategory = (resolution === '4K' || resolution === '1080p') ? 'hd' : 'free';
      const weights = calculateWeights(category, resolution);

      streams.push({
        id: `streamvix-${idx}`,
        provider: 'StreamViX',
        category,
        resolution,
        title: title.split('\n')[0] || 'StreamViX Direct',
        url: streamUrl,
        isPremium: false,
        ...weights,
        originalData: st
      });
    });
  }

  return streams;
}

// 4. HdHub
export async function scrapeHdHub(
  queryType: 'movie' | 'series',
  queryId: string,
  settings: AppSettings
): Promise<StreamLink[]> {
  const hubConfig = settings.hdHubConfig;
  const url = `https://hdhub.thevolecitor.qzz.io/${hubConfig}/stream/${queryType}/${queryId}.json`;
  const data = await corsFetch(url);
  const streams: StreamLink[] = [];

  if (data && Array.isArray(data.streams)) {
    data.streams.forEach((st: any, idx: number) => {
      const streamUrl = st.url || '';
      const lowerUrl = streamUrl.toLowerCase();

      // Filtering
      if (
        lowerUrl.includes('hubcloud') ||
        lowerUrl.includes('login.php') ||
        lowerUrl.includes('.zip') ||
        lowerUrl.includes('.rar')
      ) {
        return;
      }

      const name = st.name || '';
      const description = st.description || '';
      const resolution = parseResolution(name);

      // Clean the first line of the description field by removing server/download flags
      let firstLine = description.split('\n')[0] || name;
      firstLine = firstLine
        .replace(/\[Server\]/gi, '')
        .replace(/\[Download\]/gi, '')
        .replace(/\[Fast\]/gi, '')
        .trim();

      // Extract file size using regex /💾\s*([^\]]+)/ from description
      const sizeMatch = description.match(/💾\s*([^\]\n]+)/);
      const size = sizeMatch ? sizeMatch[1].trim() : undefined;

      const category: StreamCategory = (resolution === '4K' || resolution === '1080p') ? 'hd' : 'free';
      const weights = calculateWeights(category, resolution);

      streams.push({
        id: `hdhub-${idx}`,
        provider: 'HdHub',
        category,
        resolution,
        title: firstLine || 'HdHub Premium Direct',
        url: streamUrl,
        size,
        isPremium: false,
        ...weights,
        originalData: st
      });
    });
  }

  return streams;
}

// Parallel multi-threaded execution
export async function runScrapingEngine(
  queryType: 'movie' | 'series',
  queryId: string,
  settings: AppSettings,
  onProgress: (provider: StreamProvider, status: 'querying' | 'success' | 'error', count: number, executionTimeMs?: number) => void
): Promise<StreamLink[]> {
  
  // Fire all four endpoints in parallel
  const tasks = [
    // 1. Torrentio
    (async () => {
      const start = performance.now();
      onProgress('Torrentio', 'querying', 0);
      try {
        const res = await scrapeTorrentio(queryType, queryId, settings);
        const duration = Math.round(performance.now() - start);
        onProgress('Torrentio', 'success', res.length, duration);
        return res;
      } catch (err) {
        const duration = Math.round(performance.now() - start);
        onProgress('Torrentio', 'error', 0, duration);
        return [];
      }
    })(),

    // 2. NoTorrent
    (async () => {
      const start = performance.now();
      onProgress('NoTorrent', 'querying', 0);
      try {
        const res = await scrapeNoTorrent(queryType, queryId);
        const duration = Math.round(performance.now() - start);
        onProgress('NoTorrent', 'success', res.length, duration);
        return res;
      } catch (err) {
        const duration = Math.round(performance.now() - start);
        onProgress('NoTorrent', 'error', 0, duration);
        return [];
      }
    })(),

    // 3. StreamViX
    (async () => {
      const start = performance.now();
      onProgress('StreamViX', 'querying', 0);
      try {
        const res = await scrapeStreamViX(queryType, queryId, settings);
        const duration = Math.round(performance.now() - start);
        onProgress('StreamViX', 'success', res.length, duration);
        return res;
      } catch (err) {
        const duration = Math.round(performance.now() - start);
        onProgress('StreamViX', 'error', 0, duration);
        return [];
      }
    })(),

    // 4. HdHub
    (async () => {
      const start = performance.now();
      onProgress('HdHub', 'querying', 0);
      try {
        const res = await scrapeHdHub(queryType, queryId, settings);
        const duration = Math.round(performance.now() - start);
        onProgress('HdHub', 'success', res.length, duration);
        return res;
      } catch (err) {
        const duration = Math.round(performance.now() - start);
        onProgress('HdHub', 'error', 0, duration);
        return [];
      }
    })()
  ];

  const results = await Promise.all(tasks);
  
  // Merge all streams
  const merged: StreamLink[] = results.flat();

  // Sort them according to quality weights: totalWeight descending
  merged.sort((a, b) => {
    if (b.totalWeight !== a.totalWeight) {
      return b.totalWeight - a.totalWeight;
    }
    // If weights are equal, sort by category weight
    if (b.categoryWeight !== a.categoryWeight) {
      return b.categoryWeight - a.categoryWeight;
    }
    // If category weights are equal, sort by resolution weight
    return b.resolutionWeight - a.resolutionWeight;
  });

  return merged;
}
