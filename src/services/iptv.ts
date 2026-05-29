export interface IPTVChannel {
  id: string;
  name: string;
  url: string;
  logo?: string;
  category?: string;
}

export const IPTV_CATEGORIES = [
  { id: 'news', name: 'News', emoji: '📰' },
  { id: 'sports', name: 'Sports', emoji: '⚽' },
  { id: 'movies', name: 'Movies', emoji: '🎬' },
  { id: 'music', name: 'Music', emoji: '🎵' },
  { id: 'documentary', name: 'Documentary', emoji: '🔬' },
  { id: 'animation', name: 'Animation', emoji: '🎨' },
  { id: 'kids', name: 'Kids', emoji: '🧸' },
  { id: 'comedy', name: 'Comedy', emoji: '🎭' },
  { id: 'entertainment', name: 'Entertainment', emoji: '🍿' }
];

export async function fetchIPTVCategory(categoryId: string): Promise<IPTVChannel[]> {
  const url = `https://iptv-org.github.io/iptv/categories/${categoryId}.m3u`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch IPTV playlist for category: ${categoryId}`);
  }
  const text = await res.text();
  return parseM3U(text, categoryId);
}

function parseM3U(content: string, defaultCategory: string): IPTVChannel[] {
  const lines = content.split('\n');
  const channels: IPTVChannel[] = [];
  let currentInfo: Partial<IPTVChannel> | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    if (line.startsWith('#EXTINF:')) {
      const nameMatch = line.match(/,(.+)$/);
      const name = nameMatch ? nameMatch[1].trim() : 'Unknown Channel';

      const logoMatch = line.match(/tvg-logo="([^"]*)"/);
      const logo = logoMatch && logoMatch[1] ? logoMatch[1] : undefined;

      const idMatch = line.match(/tvg-id="([^"]*)"/);
      const id = idMatch && idMatch[1] ? idMatch[1] : `channel-${Math.random().toString(36).substr(2, 9)}`;

      const groupMatch = line.match(/group-title="([^"]*)"/);
      const category = groupMatch && groupMatch[1] ? groupMatch[1] : defaultCategory;

      currentInfo = {
        id,
        name,
        logo,
        category: category.toLowerCase()
      };
    } else if (line.startsWith('http') && currentInfo) {
      channels.push({
        id: currentInfo.id!,
        name: currentInfo.name!,
        url: line,
        logo: currentInfo.logo,
        category: currentInfo.category
      });
      currentInfo = null;
    }
  }
  return channels;
}
