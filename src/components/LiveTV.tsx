import React, { useState, useEffect } from 'react';
import { Search, Tv, Loader2, AlertCircle } from 'lucide-react';
import { IPTVChannel, IPTV_CATEGORIES, fetchIPTVCategory } from '../services/iptv';
import { AppSettings } from '../types';

interface LiveTVProps {
  onLaunchStream: (channel: IPTVChannel) => void;
  settings: AppSettings;
}

export const LiveTV: React.FC<LiveTVProps> = ({ onLaunchStream }) => {
  const [activeCategory, setActiveCategory] = useState<string>('news');
  const [channels, setChannels] = useState<IPTVChannel[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const channelsPerPage = 36;

  useEffect(() => {
    let cancelled = false;
    async function loadChannels() {
      setLoading(true);
      setError('');
      setPage(1);
      try {
        const list = await fetchIPTVCategory(activeCategory);
        if (!cancelled) {
          setChannels(list);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message || 'Failed to retrieve Live TV channel playlist.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    loadChannels();
    return () => {
      cancelled = true;
    };
  }, [activeCategory]);

  const filteredChannels = channels.filter(channel =>
    channel.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const paginatedChannels = filteredChannels.slice(0, page * channelsPerPage);

  return (
    <div className="max-w-7xl mx-auto py-4 px-4 lg:px-8 space-y-6">
      
      {/* Search and Category header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4 animate-in fade-in duration-300">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-6 bg-red-650 rounded-full" />
          <h2 className="text-xl lg:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Tv className="w-5 h-5 text-red-500 animate-pulse" />
            <span>Live TV Channels</span>
          </h2>
        </div>

        {/* Live Search bar */}
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search channels..."
            className="w-full bg-slate-900/90 text-slate-200 text-sm rounded-xl border border-slate-800 px-4 py-2 pl-10 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
        </div>
      </div>

      {/* Category Chips Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar border-b border-slate-900 animate-in fade-in duration-400">
        {IPTV_CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border shrink-0 flex items-center gap-1.5 cursor-pointer focus:outline-none focus:ring-1 focus:ring-red-600 ${
                isActive
                  ? 'bg-red-655 border-red-500 text-white shadow-lg shadow-red-950/20'
                  : 'bg-zinc-950/40 border-zinc-800 text-slate-400 hover:text-slate-200 hover:border-zinc-700'
              }`}
            >
              <span>{cat.emoji}</span>
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* Channel Grid content */}
      {loading ? (
        <div className="w-full py-32 flex flex-col items-center justify-center animate-in fade-in duration-300">
          <Loader2 className="w-10 h-10 border-4 border-red-655 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-slate-400 font-medium text-sm">Downloading TV Playlist from IPTV-org...</p>
        </div>
      ) : error ? (
        <div className="glass-panel rounded-2xl p-12 border border-slate-800 text-center max-w-lg mx-auto animate-in zoom-in-95 duration-200">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <p className="font-bold text-lg text-white mb-2">Playlist Download Failed</p>
          <p className="text-slate-400 text-sm mb-6">{error}</p>
          <button
            onClick={() => setActiveCategory(activeCategory)}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs border border-slate-700 transition-colors cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      ) : paginatedChannels.length === 0 ? (
        <div className="glass-panel rounded-2xl p-16 border border-slate-800 text-center max-w-md mx-auto animate-in zoom-in-95 duration-200">
          <Tv className="w-12 h-12 text-slate-600 mx-auto mb-3 animate-pulse" />
          <p className="font-bold text-slate-300">No Channels Found</p>
          <p className="text-xs text-slate-500 mt-1">Try updating your search filters or browse other live categories.</p>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {paginatedChannels.map((channel) => (
              <button
                key={`${channel.id}-${channel.url}`}
                onClick={() => onLaunchStream(channel)}
                className="glass-panel border border-slate-800/80 rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-3 hover:border-red-655 hover:scale-105 active:scale-95 focus:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all cursor-pointer group"
              >
                
                {/* Channel Logo frame */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-950 rounded-xl flex items-center justify-center overflow-hidden p-2 border border-slate-800 shadow-inner group-hover:border-red-900/30 transition-colors relative shrink-0">
                  {channel.logo ? (
                    <img
                      src={channel.logo}
                      alt=""
                      loading="lazy"
                      onError={(e) => {
                        // Fallback on image load error
                        (e.target as HTMLImageElement).style.display = 'none';
                        const sibling = (e.target as HTMLImageElement).nextElementSibling;
                        if (sibling) sibling.classList.remove('hidden');
                      }}
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : null}
                  
                  {/* TV Fallback icon */}
                  <div className={`text-slate-600 flex items-center justify-center w-full h-full ${channel.logo ? 'hidden absolute inset-0' : ''}`}>
                    <Tv className="w-8 h-8 group-hover:text-red-500 transition-colors" />
                  </div>
                </div>

                <div className="flex flex-col gap-0.5 w-full">
                  <span className="font-black text-xs text-slate-200 group-hover:text-white transition-colors line-clamp-2 leading-tight">
                    {channel.name}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-slate-500 font-mono tracking-wider">
                    {activeCategory}
                  </span>
                </div>

              </button>
            ))}
          </div>

          {/* Load More Button */}
          {filteredChannels.length > paginatedChannels.length && (
            <div className="flex justify-center pt-4 pb-12">
              <button
                onClick={() => setPage(prev => prev + 1)}
                className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-sm border border-slate-700 hover:border-slate-600 transition-colors shadow-md cursor-pointer"
              >
                Load More Channels
              </button>
            </div>
          )}
        </div>
      )}
      
    </div>
  );
};
