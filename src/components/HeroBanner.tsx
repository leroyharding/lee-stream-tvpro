import React, { useEffect, useState } from 'react';
import { Play, Info, Star, Calendar } from 'lucide-react';
import { TMDbMedia } from '../types';
import { getImageUrl } from '../services/tmdb';

interface HeroBannerProps {
  mediaList?: TMDbMedia[];
  onSelect: (media: TMDbMedia) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ mediaList = [], onSelect }) => {
  const [activeIndex, setActiveIndex] = useState<number>(0);

  // Auto-rotate every 8 seconds
  useEffect(() => {
    if (!mediaList || mediaList.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % mediaList.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [mediaList]);

  if (!mediaList || mediaList.length === 0) return null;

  return (
    <div className="relative w-full h-[55vh] min-h-[420px] max-h-[600px] select-none overflow-hidden group bg-[#0b0f17]">
      
      {/* Stacked Slides for Cinematic Crossfade & Ken Burns Zoom Effect */}
      {mediaList.map((media, idx) => {
        const isActive = idx === activeIndex;
        const title = media.title || media.name || media.original_title;
        const backdropUrl = getImageUrl(media.backdrop_path, 'original');
        const releaseYear = (media.release_date || media.first_air_date || '').split('-')[0];

        return (
          <div
            key={`${media.id}-${idx}`}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              isActive ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            {/* Background Image */}
            {backdropUrl ? (
              <img
                src={backdropUrl}
                alt={title}
                className={`absolute inset-0 w-full h-full object-cover object-top transition-transform duration-[8500ms] ease-out ${
                  isActive ? 'scale-100 translate-y-0' : 'scale-105 -translate-y-2'
                }`}
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-950" />
            )}

            {/* Cinematic Vignette Gradients */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f17] via-[#0b0f17]/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0b0f17] via-[#0b0f17]/80 to-transparent w-4/5" />

            {/* Content Metadata overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-12 z-20 max-w-4xl animate-in fade-in slide-in-from-left-6 duration-700">
              
              {/* Pills */}
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <span className="bg-red-600 text-white font-black text-[10px] tracking-wider px-2 py-0.5 rounded uppercase">
                  Trending #{idx + 1}
                </span>
                
                {media.vote_average ? (
                  <div className="flex items-center gap-1 bg-slate-900/80 backdrop-blur text-amber-400 text-xs font-bold px-2.5 py-0.5 rounded-full border border-slate-700">
                    <Star className="w-3 h-3 fill-amber-400" />
                    <span>{media.vote_average.toFixed(1)}</span>
                  </div>
                ) : null}

                {releaseYear ? (
                  <div className="flex items-center gap-1 text-slate-300 text-xs font-medium">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>{releaseYear}</span>
                  </div>
                ) : null}

                {media.media_type && (
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {media.media_type === 'movie' ? 'Cinematic Movie' : 'TV Series'}
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight drop-shadow-md mb-3 line-clamp-2">
                {title}
              </h1>

              {/* Overview */}
              <p className="text-slate-300 text-sm sm:text-base max-w-2xl line-clamp-3 mb-6 drop-shadow">
                {media.overview || 'No synopsis available for this feature.'}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4">
                <button
                  onClick={() => onSelect(media)}
                  className="flex items-center gap-2.5 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-bold px-6 py-3 rounded-full shadow-lg shadow-red-600/40 hover:scale-105 active:scale-95 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <Play className="w-5 h-5 fill-white" />
                  <span>Resolve Streams</span>
                </button>

                <button
                  onClick={() => onSelect(media)}
                  className="flex items-center gap-2 bg-slate-800/80 hover:bg-slate-700/80 backdrop-blur text-slate-200 font-semibold px-5 py-3 rounded-full border border-slate-700 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-500"
                >
                  <Info className="w-4 h-4" />
                  <span>More Info</span>
                </button>
              </div>

            </div>
          </div>
        );
      })}

      {/* Dot Navigation Indicators */}
      <div className="absolute bottom-6 right-6 lg:right-12 z-30 flex items-center gap-2">
        {mediaList.map((_, idx) => {
          const isActive = idx === activeIndex;
          return (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 focus:outline-none cursor-pointer ${
                isActive
                  ? 'bg-red-600 w-6 shadow shadow-red-500/50'
                  : 'bg-slate-600/80 hover:bg-slate-400 focus:bg-slate-400'
              }`}
              title={`Slide ${idx + 1}`}
            />
          );
        })}
      </div>

    </div>
  );
};
