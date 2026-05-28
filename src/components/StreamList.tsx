import React from 'react';
import { Play, HardDrive, Users, ExternalLink, Zap } from 'lucide-react';
import { StreamLink, AppSettings } from '../types';

interface StreamListProps {
  streams: StreamLink[];
  onSelectStream: (stream: StreamLink) => void;
  settings: AppSettings;
}

export const StreamList: React.FC<StreamListProps> = ({
  streams,
  onSelectStream,
  settings
}) => {

  if (!streams || streams.length === 0) {
    return (
      <div className="w-full py-12 text-center bg-slate-950/40 rounded-xl border border-slate-800">
        <p className="text-slate-400 font-medium">No playable streams resolved.</p>
        <p className="text-slate-600 text-xs mt-1">
          Verify your scraping config endpoints or ensure your Real-Debrid subscription is active.
        </p>
      </div>
    );
  }

  // Get color per resolution
  const getResBadge = (res: string) => {
    switch (res) {
      case '4K':
        return 'bg-amber-500 text-slate-950 font-black border-amber-400';
      case '1080p':
        return 'bg-blue-600 text-white font-bold border-blue-500';
      case '720p':
        return 'bg-slate-700 text-slate-200 font-medium border-slate-600';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  // Get badge per category
  const getCatBadge = (cat: string) => {
    switch (cat) {
      case 'rd':
        return 'bg-emerald-950 text-emerald-400 border-emerald-800';
      case 'hd':
        return 'bg-cyan-950 text-cyan-400 border-cyan-800';
      default:
        return 'bg-slate-900 text-slate-400 border-slate-800';
    }
  };

  // Get label per category
  const getCatLabel = (cat: string) => {
    switch (cat) {
      case 'rd': return 'RD Premium';
      case 'hd': return 'Direct HD';
      default: return 'Free P2P';
    }
  };

  // Get color per provider
  const getProviderColor = (prov: string) => {
    switch (prov) {
      case 'Torrentio': return 'text-purple-400';
      case 'NoTorrent': return 'text-rose-400';
      case 'StreamViX': return 'text-sky-400';
      case 'HdHub': return 'text-amber-400';
      default: return 'text-slate-400';
    }
  };

  return (
    <div className="space-y-2.5">
      
      {/* Top statistics summary */}
      <div className="flex items-center justify-between px-1 text-xs text-slate-400 font-medium">
        <span>Resolved: <strong className="text-white">{streams.length}</strong> available streams</span>
        <span className="hidden sm:inline">Sorted by quality hierarchy</span>
      </div>

      {/* Renders list */}
      {streams.map((stream, idx) => {
        const isHighestQuality = idx === 0;

        return (
          <div
            key={`${stream.id}-${idx}`}
            onClick={() => onSelectStream(stream)}
            tabIndex={0}
            role="button"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelectStream(stream);
              }
            }}
            className={`group relative w-full bg-slate-900/80 hover:bg-slate-800/90 border rounded-xl p-3 sm:p-4 transition-all duration-200 cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
              isHighestQuality 
                ? 'border-red-500/60 shadow-lg shadow-red-950/20' 
                : 'border-slate-800 hover:border-slate-700'
            }`}
          >
            {/* Left Column: Metadata Tags & Title */}
            <div className="flex flex-col items-start gap-2 w-full sm:w-3/4">
              
              {/* Top Tags Row */}
              <div className="flex flex-wrap items-center gap-2">
                
                {/* Resolution Pill */}
                <span className={`text-[10px] px-2 py-0.5 rounded border uppercase tracking-wider ${getResBadge(stream.resolution)}`}>
                  {stream.resolution}
                </span>

                {/* Category Pill */}
                <span className={`text-[10px] px-2 py-0.5 rounded border font-semibold ${getCatBadge(stream.category)}`}>
                  {getCatLabel(stream.category)}
                </span>

                {/* Provider Pill */}
                <span className={`text-xs font-bold ${getProviderColor(stream.provider)}`}>
                  {stream.provider}
                </span>

                {/* Automation highlight indicator */}
                {isHighestQuality && (
                  <span className="flex items-center gap-1 text-[10px] text-red-400 font-bold bg-red-950/50 px-1.5 py-0.5 rounded border border-red-900">
                    <Zap className="w-2.5 h-2.5 fill-red-400" />
                    <span>Top Pick</span>
                  </span>
                )}

              </div>

              {/* Stream Title */}
              <h4 className="text-xs sm:text-sm font-semibold text-slate-200 group-hover:text-white line-clamp-2 leading-tight">
                {stream.title}
              </h4>

              {/* Bottom Extra Info Row */}
              <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 font-mono">
                {stream.size && (
                  <span className="flex items-center gap-1">
                    <HardDrive className="w-3 h-3 text-slate-500" />
                    <span>{stream.size}</span>
                  </span>
                )}

                {stream.seeds !== undefined && (
                  <span className="flex items-center gap-1 text-emerald-400/90">
                    <Users className="w-3 h-3 text-emerald-500" />
                    <span>{stream.seeds} seeds</span>
                  </span>
                )}

                {/* Total sort weight */}
                <span className="text-slate-600 text-[10px]" title="Category Weight * 10 + Resolution Weight">
                  Weight: {stream.totalWeight}
                </span>
              </div>

            </div>

            {/* Right Column: Launch Button */}
            <div className="w-full sm:w-auto flex items-center justify-end shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectStream(stream);
                }}
                tabIndex={-1}
                className={`w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-bold text-xs transition-all ${
                  isHighestQuality
                    ? 'bg-red-600 hover:bg-red-500 text-white shadow'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                }`}
              >
                {settings.playerMode === 'android_intent' ? (
                  <>
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Launch Intent</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Play Stream</span>
                  </>
                )}
              </button>

            </div>

          </div>
        );
      })}

    </div>
  );
};
