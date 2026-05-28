import React, { useEffect, useState } from 'react';
import { X, Play, Star, Calendar, Clock, Film, Tv, AlertCircle, Heart } from 'lucide-react';
import { TMDbMedia, TMDbMediaDetail, TMDbEpisode, ContinueWatchingItem } from '../types';
import { getMediaDetails, getSeasonDetails, getExternalIds, getImageUrl } from '../services/tmdb';

interface MediaDetailModalProps {
  media: TMDbMedia;
  onClose: () => void;
  onStartScraping: (
    queryType: 'movie' | 'series',
    queryId: string,
    titleContext: string
  ) => void;
  watchlist: TMDbMedia[];
  onToggleWatchlist: (media: TMDbMedia) => void;
  continueWatching: ContinueWatchingItem[];
  onResumePlayback: (item: ContinueWatchingItem, queryId: string, titleContext: string) => void;
  onClearProgress: (mediaId: number) => void;
  onSelectPerson: (personId: number, personName: string) => void;
}

export const MediaDetailModal: React.FC<MediaDetailModalProps> = ({
  media,
  onClose,
  onStartScraping,
  watchlist,
  onToggleWatchlist,
  continueWatching,
  onResumePlayback,
  onClearProgress,
  onSelectPerson
}) => {
  const isAdded = watchlist.some(item => item.id === media.id);

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '00:00';
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const remainSecs = Math.floor(secs % 60);
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${remainSecs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${remainSecs.toString().padStart(2, '0')}`;
  };
  const [detail, setDetail] = useState<TMDbMediaDetail | null>(null);
  const [imdbId, setImdbId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Series selection
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [episodes, setEpisodes] = useState<TMDbEpisode[]>([]);
  const [selectedEpisode, setSelectedEpisode] = useState<number>(1);
  const [loadingEpisodes, setLoadingEpisodes] = useState<boolean>(false);

  const isMovie = media.media_type === 'movie' || !media.media_type;

  // Load deep metadata & external ID
  useEffect(() => {
    async function load() {
      setLoading(true);
      setError('');
      try {
        const type = isMovie ? 'movie' : 'tv';
        const fullDetail = await getMediaDetails(media.id, type);
        setDetail(fullDetail);

        // Fetch external IDs for IMDb ID
        const ids = await getExternalIds(media.id, type);
        if (ids.imdb_id) {
          setImdbId(ids.imdb_id);
        } else {
          // If no direct IMDb ID, try to fallback or display a soft warning
          setError('IMDb ID missing for this title. Scrapers require an IMDb ID.');
        }

        // If it's a TV series, pick the first non-zero season as default, or resume progress season
        if (!isMovie && fullDetail.seasons && fullDetail.seasons.length > 0) {
          const progressItem = continueWatching.find(item => item.media.id === media.id);
          if (progressItem && progressItem.season !== undefined) {
            setSelectedSeason(progressItem.season);
          } else {
            const firstRealSeason = fullDetail.seasons.find(s => s.season_number > 0) || fullDetail.seasons[0];
            setSelectedSeason(firstRealSeason.season_number);
          }
        }

      } catch (err: any) {
        setError(err.message || 'Failed to load media details');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [media]);

  // Load episodes when selectedSeason changes
  useEffect(() => {
    async function loadEps() {
      if (isMovie || !detail) return;
      setLoadingEpisodes(true);
      try {
        const seasonData = await getSeasonDetails(media.id, selectedSeason);
        if (seasonData && seasonData.episodes) {
          setEpisodes(seasonData.episodes);
          const progressItem = continueWatching.find(item => item.media.id === media.id && item.season === selectedSeason);
          if (progressItem && progressItem.episode !== undefined) {
            setSelectedEpisode(progressItem.episode);
          } else if (seasonData.episodes.length > 0) {
            setSelectedEpisode(seasonData.episodes[0].episode_number);
          }
        }
      } catch (err) {
        console.error('Failed to load episodes', err);
      } finally {
        setLoadingEpisodes(false);
      }
    }
    loadEps();
  }, [selectedSeason, detail, media.id, isMovie]);

  const handleLaunchScraper = () => {
    if (!imdbId) {
      alert('Cannot scrape: IMDb ID is missing for this title.');
      return;
    }

    const titleContext = detail?.title || detail?.name || media.title || media.name || '';

    if (isMovie) {
      onStartScraping('movie', imdbId, titleContext);
    } else {
      // For series, format is {imdbId}:{season}:{episode}
      const queryId = `${imdbId}:${selectedSeason}:${selectedEpisode}`;
      const epObj = episodes.find(e => e.episode_number === selectedEpisode);
      const epName = epObj ? ` - S${selectedSeason}E${selectedEpisode}: ${epObj.name}` : ` - S${selectedSeason}E${selectedEpisode}`;
      onStartScraping('series', queryId, titleContext + epName);
    }
  };

  const titleText = detail?.title || detail?.name || media.title || media.name;
  const backdropUrl = getImageUrl(detail?.backdrop_path || media.backdrop_path, 'original');
  const posterUrl = getImageUrl(detail?.poster_path || media.poster_path, 'w500');

  // Find trailer
  const videos: any[] = (detail as any)?.videos?.results || [];
  const trailer = videos.find(v => v.type === 'Trailer' && v.site === 'YouTube') || videos[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      
      {/* Modal Card */}
      <div className="relative w-full max-w-5xl bg-[#0e1420] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl my-auto animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 p-2.5 rounded-full bg-slate-900/80 hover:bg-red-650 text-slate-300 hover:text-white border border-slate-800 transition-colors focus:outline-none focus:border-red-500 cursor-pointer"
          title="Close Details"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Scrollable Body */}
        <div className="overflow-y-auto flex-grow no-scrollbar">
          {loading ? (
            <div className="w-full h-96 flex flex-col items-center justify-center">
              <div className="w-10 h-10 border-4 border-red-650 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-slate-400 font-medium">Resolving Media Catalog & IMDb ID...</p>
            </div>
          ) : (
            <div className="flex flex-col">
            
            {/* Top Cinematic Backdrop */}
            <div className="relative w-full h-64 sm:h-80 md:h-96 bg-slate-950 overflow-hidden select-none">
              {backdropUrl ? (
                <img
                  src={backdropUrl}
                  alt={titleText}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                  <Film className="w-16 h-16 text-slate-800" />
                </div>
              )}

              {/* Gradient fade */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0e1420] via-[#0e1420]/40 to-transparent" />
              
              {/* Bottom aligned tags */}
              <div className="absolute bottom-4 left-6 right-6 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    {detail?.status && (
                      <span className="bg-slate-900/80 backdrop-blur text-slate-300 text-xs px-2 py-0.5 rounded border border-slate-700">
                        {detail.status}
                      </span>
                    )}

                    {imdbId && (
                      <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs px-2 py-0.5 rounded font-mono">
                        IMDb: {imdbId}
                      </span>
                    )}
                  </div>

                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight drop-shadow">
                    {titleText}
                  </h1>

                  {detail?.tagline && (
                    <p className="text-red-400 text-xs sm:text-sm font-medium italic mt-1 drop-shadow">
                      "{detail.tagline}"
                    </p>
                  )}
                </div>

                {/* Primary Scrape Button & Watchlist Toggle */}
                {imdbId && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onToggleWatchlist(media)}
                      className={`p-3 rounded-xl border backdrop-blur transition-all cursor-pointer ${
                        isAdded 
                          ? 'bg-red-950/80 text-red-400 border-red-800/80 hover:bg-red-900/80' 
                          : 'bg-slate-900/80 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800/80'
                      }`}
                      title={isAdded ? "Remove from Watchlist" : "Add to Watchlist"}
                    >
                      <Heart className={`w-5 h-5 ${isAdded ? 'fill-red-500 text-red-500' : ''}`} />
                    </button>

                    <button
                      onClick={handleLaunchScraper}
                      className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-red-950 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                    >
                      <Play className="w-5 h-5 fill-white" />
                      <span>Find Streams</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Content Area */}
            <div className="p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Column: Metadata & Details */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Stats Row */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-300 border-b border-slate-800 pb-4">
                  {detail?.vote_average ? (
                    <div className="flex items-center gap-1 text-amber-400 font-bold">
                      <Star className="w-4 h-4 fill-amber-400" />
                      <span>{detail.vote_average.toFixed(1)} / 10</span>
                    </div>
                  ) : null}

                  {detail?.release_date || detail?.first_air_date ? (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span>{detail.release_date || detail.first_air_date}</span>
                    </div>
                  ) : null}

                  {detail?.runtime ? (
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span>{detail.runtime} mins</span>
                    </div>
                  ) : null}

                  <div className="flex items-center gap-1">
                    {isMovie ? <Film className="w-4 h-4 text-slate-400" /> : <Tv className="w-4 h-4 text-slate-400" />}
                    <span className="capitalize">{isMovie ? 'Movie' : 'TV Series'}</span>
                  </div>
                </div>

                {/* Genres */}
                {detail?.genres && detail.genres.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {detail.genres.map(g => (
                      <span key={g.id} className="bg-slate-900 text-slate-300 text-xs px-2.5 py-1 rounded-md border border-slate-800">
                        {g.name}
                      </span>
                    ))}
                  </div>
                )}

                {/* Overview */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Synopsis
                  </h3>
                  <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                    {detail?.overview || media.overview || 'No description available.'}
                  </p>
                </div>

                {/* Error if no IMDb ID */}
                {error && (
                  <div className="flex items-center gap-2 p-3 bg-amber-950/40 border border-amber-800 rounded-lg text-amber-300 text-sm">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Trailer section if available */}
                {trailer && trailer.key && (
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Official Trailer
                    </h3>
                    <div className="aspect-video w-full rounded-xl overflow-hidden bg-black border border-slate-800">
                      <iframe
                        src={`https://www.youtube.com/embed/${trailer.key}?autoplay=0&controls=1`}
                        title="Trailer"
                        className="w-full h-full"
                        allowFullScreen
                      />
                    </div>
                  </div>
                )}

                {/* Cast & Crew Section */}
                {(() => {
                  const castList = detail?.credits?.cast || [];
                  const crewList = detail?.credits?.crew || [];
                  
                  const directors = crewList.filter((c: any) => c.job === 'Director').slice(0, 1);
                  const creators = crewList.filter((c: any) => c.job === 'Creator' || c.job === 'Writer').slice(0, 1);
                  
                  const crewCards = [...directors, ...creators].map((c: any) => ({
                    id: c.id,
                    name: c.name,
                    sub: c.job,
                    profile_path: c.profile_path
                  }));
                  
                  const castCards = castList.slice(0, 10).map((c: any) => ({
                    id: c.id,
                    name: c.name,
                    sub: c.character,
                    profile_path: c.profile_path
                  }));
                  
                  const combinedCredits = [...crewCards, ...castCards];

                  if (combinedCredits.length === 0) return null;

                  return (
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                        Cast & Crew
                      </h3>
                      <div className="flex overflow-x-auto gap-4 pb-3 no-scrollbar snap-x scroll-smooth">
                        {combinedCredits.map((member) => {
                          const profileUrl = getImageUrl(member.profile_path, 'w500');
                          return (
                            <button
                              key={`${member.id}-${member.sub}`}
                              onClick={() => onSelectPerson(member.id, member.name)}
                              className="w-24 sm:w-28 shrink-0 text-center snap-start group/cast focus:outline-none cursor-pointer"
                            >
                              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full overflow-hidden border border-slate-800 bg-slate-900 group-hover/cast:border-red-500 group-focus/cast:border-red-500 transition-all duration-300">
                                {profileUrl ? (
                                  <img
                                    src={profileUrl}
                                    alt={member.name}
                                    className="w-full h-full object-cover group-hover/cast:scale-105 transition-transform duration-300"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm font-bold uppercase bg-slate-800">
                                    {(member.name || '').split(' ').map((n: string) => n[0]).slice(0, 2).join('')}
                                  </div>
                                )}
                              </div>
                              <p className="text-xs font-bold text-slate-200 mt-2 truncate group-hover/cast:text-white transition-colors">
                                {member.name}
                              </p>
                              <p className="text-[10px] text-slate-500 truncate mt-0.5">
                                {member.sub}
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}

              </div>

              {/* Right Column: TV Series Season & Episode Selector */}
              <div className="space-y-6">
                
                {/* Poster image for desktop */}
                <div className="hidden lg:block w-3/4 mx-auto aspect-[2/3] rounded-xl overflow-hidden bg-slate-900 border border-slate-800 shadow">
                  {posterUrl ? (
                    <img src={posterUrl} alt={titleText} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-700">
                      <Film className="w-12 h-12" />
                    </div>
                  )}
                </div>

                {/* Season & Episode Explorer */}
                {!isMovie && detail?.seasons && (
                  <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-4">
                    
                    {/* Season Dropdown */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                        Select Season
                      </label>
                      <select
                        value={selectedSeason}
                        onChange={(e) => setSelectedSeason(Number(e.target.value))}
                        className="w-full bg-slate-950 text-slate-200 text-sm rounded-lg border border-slate-700 px-3 py-2 focus:outline-none focus:border-red-500"
                      >
                        {detail.seasons
                          .filter(s => s.season_number > 0) // Hide specials unless desired
                          .map(s => (
                            <option key={s.id} value={s.season_number}>
                              Season {s.season_number} ({s.episode_count} Episodes)
                            </option>
                          ))
                        }
                      </select>
                    </div>

                    {/* Episodes List */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                        Select Episode
                      </label>

                      {loadingEpisodes ? (
                        <div className="py-8 text-center text-slate-500 text-xs">
                          Loading episodes...
                        </div>
                      ) : (
                        <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
                          {episodes.map(ep => {
                            const isSelected = ep.episode_number === selectedEpisode;
                            return (
                              <button
                                key={ep.id}
                                onClick={() => setSelectedEpisode(ep.episode_number)}
                                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-between gap-2 ${
                                  isSelected 
                                    ? 'bg-red-950/60 text-red-400 border border-red-800/80' 
                                    : 'bg-slate-950/40 text-slate-300 hover:bg-slate-800/60'
                                }`}
                              >
                                <span className="truncate">
                                  {ep.episode_number}. {ep.name}
                                </span>
                                {ep.vote_average ? (
                                  <span className="text-[10px] text-slate-500 font-mono shrink-0">
                                    ★{ep.vote_average.toFixed(1)}
                                  </span>
                                ) : null}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Current Episode Details */}
                    {episodes.length > 0 && (
                      <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                        <span className="font-bold text-slate-300 block mb-0.5">
                          Episode {selectedEpisode} Synopsis:
                        </span>
                        <p className="line-clamp-3">
                          {episodes.find(e => e.episode_number === selectedEpisode)?.overview || 'No episode description available.'}
                        </p>
                      </div>
                    )}

                  </div>
                )}

                {/* Launch Action & Resume */}
                <div className="pt-2">
                  {(() => {
                    const progressItem = continueWatching.find(item => 
                      item.media.id === media.id &&
                      (isMovie || (item.season === selectedSeason && item.episode === selectedEpisode))
                    );

                    return (
                      <div className="space-y-3">
                         {progressItem && (
                          <button
                            onClick={() => {
                              const queryId = isMovie ? imdbId : `${imdbId}:${selectedSeason}:${selectedEpisode}`;
                              const epObj = episodes.find(e => e.episode_number === selectedEpisode);
                              const epName = epObj ? ` - S${selectedSeason}E${selectedEpisode}: ${epObj.name}` : ` - S${selectedSeason}E${selectedEpisode}`;
                              const titleContext = detail?.title || detail?.name || media.title || media.name || '';
                              const fullTitle = isMovie ? titleContext : titleContext + epName;
                              onResumePlayback(progressItem, queryId, fullTitle);
                            }}
                            className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-lg shadow-red-950/40 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
                          >
                            <Play className="w-4 h-4 fill-white" />
                            <span>
                              Resume {isMovie ? 'Movie' : `S${selectedSeason}E${selectedEpisode}`} at {formatTime(progressItem.currentTime)}
                            </span>
                          </button>
                        )}

                        <button
                          onClick={() => {
                            onClearProgress(media.id);
                            handleLaunchScraper();
                          }}
                          disabled={!imdbId}
                          className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                            progressItem 
                              ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                              : imdbId
                                ? 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-950 hover:scale-[1.02]'
                                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          }`}
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>
                            {progressItem 
                              ? 'Scrape Fresh Streams (Start Over)' 
                              : isMovie 
                                ? 'Scrape Movie Links' 
                                : `Scrape S${selectedSeason}E${selectedEpisode} Links`
                            }
                          </span>
                        </button>
                      </div>
                    );
                  })()}
                  {!imdbId && (
                    <span className="text-[10px] text-amber-500 text-center block mt-1">
                      IMDb ID Required
                    </span>
                  )}
                </div>

              </div>

            </div>

            </div>
          )}
        </div>

      </div>
    </div>
  );
};
