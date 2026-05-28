import React, { useEffect, useState } from 'react';
import { X, Calendar, MapPin, User, Film } from 'lucide-react';
import { TMDbMedia, TMDbPersonDetail } from '../types';
import { getPersonDetails, getPersonCredits, getImageUrl } from '../services/tmdb';
import { MediaGrid } from './MediaGrid';

interface PersonDetailModalProps {
  personId: number;
  personName: string;
  onClose: () => void;
  onSelectMedia: (media: TMDbMedia) => void;
  onLongSelectMedia?: (media: TMDbMedia) => void;
}

export const PersonDetailModal: React.FC<PersonDetailModalProps> = ({
  personId,
  personName,
  onClose,
  onSelectMedia,
  onLongSelectMedia
}) => {
  const [details, setDetails] = useState<TMDbPersonDetail | null>(null);
  const [credits, setCredits] = useState<TMDbMedia[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    async function loadPersonData() {
      setLoading(true);
      setError('');
      try {
        const [personDetails, personCredits] = await Promise.all([
          getPersonDetails(personId),
          getPersonCredits(personId)
        ]);
        setDetails(personDetails);
        setCredits(personCredits.cast || []);
      } catch (err: any) {
        console.error('Failed to load person data', err);
        setError(err.message || 'Failed to fetch person biography and credits.');
      } finally {
        setLoading(false);
      }
    }
    loadPersonData();
  }, [personId]);

  const profileUrl = details?.profile_path ? getImageUrl(details.profile_path, 'original') : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      
      {/* Modal Container */}
      <div className="relative w-full max-w-5xl bg-[#0e1420] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl my-auto animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 p-2.5 rounded-full bg-slate-900/80 hover:bg-red-650 hover:text-white text-slate-300 border border-slate-800 transition-colors cursor-pointer focus:outline-none focus:border-red-500"
          title="Close Profile"
        >
          <X className="w-5 h-5" />
        </button>

        {loading ? (
          <div className="w-full h-96 flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-4 border-red-650 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-slate-400 font-medium text-sm">Retrieving Biography & Credits...</p>
          </div>
        ) : error ? (
          <div className="w-full h-96 flex flex-col items-center justify-center p-6 text-center">
            <p className="text-red-400 font-bold text-lg mb-2">Error Loading Person Profile</p>
            <p className="text-slate-500 text-sm max-w-md">{error}</p>
          </div>
        ) : (
          <div className="overflow-y-auto flex-grow no-scrollbar">
            
            {/* Top Person Info Header */}
            <div className="p-6 sm:p-8 border-b border-slate-900 bg-slate-950/40 flex flex-col md:flex-row gap-6 items-start md:items-center">
              
              {/* Profile Image Bubble */}
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-2 border-slate-800 bg-slate-900 shrink-0 shadow-lg">
                {profileUrl ? (
                  <img src={profileUrl} alt={personName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-500">
                    <User className="w-12 h-12" />
                  </div>
                )}
              </div>

              {/* Identity Details */}
              <div className="space-y-3 flex-grow">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {details?.name || personName}
                </h1>
                
                <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-400">
                  {details?.birthday && (
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-red-500" />
                      <span>Born: {details.birthday}</span>
                    </span>
                  )}
                  {details?.place_of_birth && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-red-500" />
                      <span>{details.place_of_birth}</span>
                    </span>
                  )}
                  {details?.known_for_department && (
                    <span className="flex items-center gap-1.5">
                      <Film className="w-4 h-4 text-red-500" />
                      <span>Role: {details.known_for_department}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Biography & Credits Sections */}
            <div className="p-6 sm:p-8 space-y-8">
              
              {/* Biography Details */}
              {details?.biography && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Biography
                  </h3>
                  <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-4xl whitespace-pre-line bg-slate-950/20 border border-slate-900/60 p-4 rounded-xl">
                    {details.biography}
                  </p>
                </div>
              )}

              {/* Known For Credits Grid */}
              <div className="-mx-4 sm:-mx-8">
                <MediaGrid
                  items={credits.slice(0, 18)}
                  title={`Known For`}
                  onSelect={onSelectMedia}
                  onLongSelect={onLongSelectMedia}
                />
              </div>

            </div>

          </div>
        )}

      </div>

    </div>
  );
};
