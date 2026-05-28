import React, { useEffect } from 'react';
import { Eye, EyeOff, Heart, Info, X } from 'lucide-react';
import { TMDbMedia } from '../types';

interface PosterContextMenuModalProps {
  media: TMDbMedia;
  isAddedToWatchlist: boolean;
  isMarkedAsWatched: boolean;
  onToggleWatchlist: () => void;
  onToggleWatched: () => void;
  onViewDetails: () => void;
  onClose: () => void;
}

export const PosterContextMenuModal: React.FC<PosterContextMenuModalProps> = ({
  media,
  isAddedToWatchlist,
  isMarkedAsWatched,
  onToggleWatchlist,
  onToggleWatched,
  onViewDetails,
  onClose
}) => {
  // Keypress listener for Backspace/Escape closing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Backspace') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const titleText = media.title || media.name || media.original_title;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Menu Card */}
      <div 
        className="relative w-full max-w-sm bg-[#0e1420] border border-slate-800 rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200 space-y-4"
        onClick={(e) => e.stopPropagation()} // Prevent clicking modal from closing it
      >
        
        {/* Header Title */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <span className="text-[9px] uppercase tracking-wider text-red-500 font-bold">
              Quick Actions
            </span>
            <h3 className="text-slate-200 font-black text-sm sm:text-base line-clamp-1 mt-0.5">
              {titleText}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-slate-900/60 hover:bg-red-650 text-slate-400 hover:text-white border border-slate-800 transition-colors cursor-pointer focus:outline-none focus:border-red-500"
            title="Close actions"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Button Choices */}
        <div className="flex flex-col gap-2.5">
          
          {/* Action 1: View Details */}
          <button
            onClick={() => {
              onViewDetails();
              onClose();
            }}
            className="w-full flex items-center gap-3 px-4 py-3 bg-slate-900/40 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 hover:text-white font-bold rounded-xl text-xs sm:text-sm text-left transition-all cursor-pointer focus:outline-none focus:border-red-500 focus:scale-[1.02]"
          >
            <Info className="w-4 h-4 text-red-500" />
            <span>View Details & Stream</span>
          </button>

          {/* Action 2: Toggle Watchlist */}
          <button
            onClick={() => {
              onToggleWatchlist();
              onClose();
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 border text-xs sm:text-sm text-left font-bold rounded-xl transition-all cursor-pointer focus:outline-none focus:border-red-500 focus:scale-[1.02] ${
              isAddedToWatchlist
                ? 'bg-red-950/20 hover:bg-red-950/40 border-red-900/40 text-red-400'
                : 'bg-slate-900/40 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 hover:text-white'
            }`}
          >
            <Heart className={`w-4 h-4 ${isAddedToWatchlist ? 'fill-red-500 text-red-500' : 'text-slate-400'}`} />
            <span>{isAddedToWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}</span>
          </button>

          {/* Action 3: Toggle Watched */}
          <button
            onClick={() => {
              onToggleWatched();
              onClose();
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 border text-xs sm:text-sm text-left font-bold rounded-xl transition-all cursor-pointer focus:outline-none focus:border-red-500 focus:scale-[1.02] ${
              isMarkedAsWatched
                ? 'bg-emerald-950/20 hover:bg-emerald-950/40 border-emerald-900/40 text-emerald-400'
                : 'bg-slate-900/40 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 hover:text-white'
            }`}
          >
            {isMarkedAsWatched ? (
              <>
                <EyeOff className="w-4 h-4 text-emerald-400" />
                <span>Mark as Unwatched</span>
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 text-slate-400" />
                <span>Mark as Watched</span>
              </>
            )}
          </button>

        </div>

      </div>
    </div>
  );
};
