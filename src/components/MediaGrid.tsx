import React from 'react';
import { Star, Film, Tv, Sparkles } from 'lucide-react';
import { TMDbMedia } from '../types';
import { getImageUrl } from '../services/tmdb';

interface MediaGridProps {
  items: TMDbMedia[];
  title?: string;
  onSelect: (media: TMDbMedia) => void;
  onLongSelect?: (media: TMDbMedia) => void;
  loading?: boolean;
  layout?: 'grid' | 'row';
  progressMap?: Record<number, number>;
}

interface MediaCardProps {
  media: TMDbMedia;
  itemClass: string;
  progressMap?: Record<number, number>;
  onSelect: (media: TMDbMedia) => void;
  onLongSelect?: (media: TMDbMedia) => void;
}

const MediaCard: React.FC<MediaCardProps> = ({
  media,
  itemClass,
  progressMap,
  onSelect,
  onLongSelect
}) => {
  const timerRef = React.useRef<any>(null);
  const longPressedRef = React.useRef<boolean>(false);

  const startPress = () => {
    longPressedRef.current = false;
    timerRef.current = setTimeout(() => {
      longPressedRef.current = true;
      if (onLongSelect) {
        onLongSelect(media);
      }
    }, 700); // 700ms hold threshold
  };

  const endPress = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  // Mouse Listeners
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left click
    startPress();
  };

  const handleMouseUp = () => {
    endPress();
  };

  const handleMouseLeave = () => {
    endPress();
  };

  // Touch Listeners
  const handleTouchStart = () => {
    startPress();
  };

  const handleTouchEnd = () => {
    endPress();
  };

  const handleTouchMove = () => {
    endPress();
  };

  // D-pad Remote hold gesture
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      if (e.repeat) return;
      startPress();
    }
  };

  const handleKeyUp = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      endPress();
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (longPressedRef.current) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    onSelect(media);
  };

  const posterUrl = getImageUrl(media.poster_path, 'w500');
  const titleText = media.title || media.name || media.original_title;
  const isMovie = media.media_type === 'movie' || !media.media_type;
  const progress = progressMap ? progressMap[media.id] : undefined;

  return (
    <button
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      onClick={handleClick}
      className={itemClass}
    >
      {/* Poster Container */}
      <div className="w-full aspect-[2/3] rounded-xl overflow-hidden bg-slate-900 border border-slate-800 relative shadow-md group-hover:border-red-500/50 group-hover:shadow-red-900/20 transition-all duration-300">
        {posterUrl ? (
          <img
            src={posterUrl}
            alt={titleText}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-slate-900 text-slate-600 text-center">
            {isMovie ? <Film className="w-8 h-8 mb-2" /> : <Tv className="w-8 h-8 mb-2" />}
            <span className="text-xs font-semibold">{titleText}</span>
          </div>
        )}

        {/* Rating Badge */}
        {media.vote_average ? (
          <div className="absolute top-2.5 right-2.5 bg-slate-950/80 backdrop-blur-md text-amber-400 text-[11px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 border border-slate-700/60 shadow">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span>{media.vote_average.toFixed(1)}</span>
          </div>
        ) : null}

        {/* Media Type Badge */}
        <div className={`absolute ${progress !== undefined ? 'bottom-3.5' : 'bottom-2'} left-2 bg-slate-950/80 backdrop-blur-md text-slate-300 text-[9px] font-black tracking-wider px-1.5 py-0.5 rounded uppercase border border-slate-800 z-10`}>
          {isMovie ? 'Movie' : 'Series'}
        </div>

        {/* Progress Bar for Continue Watching */}
        {progress !== undefined && (
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-slate-950 overflow-hidden z-10">
            <div 
              className="bg-red-650 h-full rounded-r"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        )}

        {/* Hover overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
          <span className="text-red-400 font-bold text-xs underline underline-offset-2">
            Resolve Links
          </span>
        </div>
      </div>

      {/* Title & Date */}
      <div className="mt-2 w-full">
        <h3 className="text-sm font-semibold text-slate-200 group-hover:text-white line-clamp-1 transition-colors">
          {titleText}
        </h3>
        <span className="text-xs text-slate-500 block mt-0.5">
          {(media.release_date || media.first_air_date || '').split('-')[0] || 'Unknown'}
        </span>
      </div>
    </button>
  );
};

export const MediaGrid: React.FC<MediaGridProps> = ({
  items,
  title,
  onSelect,
  onLongSelect,
  loading,
  layout = 'grid',
  progressMap
}) => {
  if (loading) {
    const containerClass = layout === 'row'
      ? "flex overflow-x-auto gap-4 lg:gap-6 pb-4 no-scrollbar"
      : "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 lg:gap-6";

    const skeletonClass = layout === 'row'
      ? "w-40 sm:w-48 shrink-0 aspect-[2/3] bg-slate-800/60 rounded-xl animate-pulse"
      : "aspect-[2/3] bg-slate-800/60 rounded-xl animate-pulse";

    return (
      <div className="w-full py-6 px-4 lg:px-8">
        {title && <div className="h-8 w-48 bg-slate-800 rounded animate-pulse mb-6" />}
        <div className={containerClass}>
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className={skeletonClass} />
          ))}
        </div>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="w-full py-16 px-4 text-center">
        <Sparkles className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <p className="text-slate-400 font-medium text-lg">No media titles found.</p>
        <p className="text-slate-600 text-sm mt-1">Try refining your search query or selecting another catalog tab.</p>
      </div>
    );
  }

  const containerClass = layout === 'row'
    ? "flex overflow-x-auto gap-4 lg:gap-6 pb-4 pt-1 snap-x scroll-smooth no-scrollbar"
    : "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 lg:gap-6";

  const itemClass = layout === 'row'
    ? "w-40 sm:w-48 shrink-0 snap-start group relative flex flex-col items-start text-left focus:outline-none"
    : "group relative flex flex-col items-start text-left focus:outline-none";

  return (
    <div className="w-full py-6 px-4 lg:px-8">
      {title && (
        <div className="flex items-center gap-2 mb-6">
          <div className="w-1.5 h-6 bg-red-600 rounded-full" />
          <h2 className="text-xl lg:text-2xl font-bold tracking-tight text-white">
            {title}
          </h2>
        </div>
      )}

      <div className={containerClass}>
        {items.map((media, idx) => (
          <MediaCard
            key={`${media.id}-${media.media_type}-${idx}`}
            media={media}
            itemClass={itemClass}
            progressMap={progressMap}
            onSelect={onSelect}
            onLongSelect={onLongSelect}
          />
        ))}
      </div>
    </div>
  );
};
