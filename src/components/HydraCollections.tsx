import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Sparkles, ShieldAlert } from 'lucide-react';
import { curatedCollections, fetchCollectionItems, HydraCollection } from '../services/collections';
import { TMDbMedia } from '../types';
import { MediaGrid } from './MediaGrid';

interface HydraCollectionsProps {
  onSelectMedia: (media: TMDbMedia) => void;
  onLongSelectMedia?: (media: TMDbMedia) => void;
}

export const HydraCollections: React.FC<HydraCollectionsProps> = ({
  onSelectMedia,
  onLongSelectMedia
}) => {
  const navigate = useNavigate();
  const { collectionId } = useParams<{ collectionId?: string }>();

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [collectionItems, setCollectionItems] = useState<TMDbMedia[]>([]);
  const [currentCollection, setCurrentCollection] = useState<HydraCollection | null>(null);

  // Sync route param with active collection fetching
  useEffect(() => {
    if (!collectionId) {
      setCurrentCollection(null);
      setCollectionItems([]);
      setError('');
      return;
    }

    const matched = curatedCollections.find(c => c.id === collectionId);
    if (!matched) {
      setError(`Collection "${collectionId}" not found.`);
      return;
    }

    setCurrentCollection(matched);
    
    async function loadItems() {
      setLoading(true);
      setError('');
      try {
        const items = await fetchCollectionItems(matched!);
        setCollectionItems(items);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Failed to retrieve collection items from TMDb.');
      } finally {
        setLoading(false);
      }
    }

    loadItems();
  }, [collectionId]);

  // Render 1. DETAIL VIEW
  if (currentCollection) {
    return (
      <div className="max-w-7xl mx-auto py-4 px-4 lg:px-8 space-y-6 animate-in fade-in duration-300">
        
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/collections')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900/60 hover:bg-zinc-800 text-slate-300 hover:text-white text-xs font-semibold border border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer focus:outline-none focus:ring-1 focus:ring-red-600"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Collections</span>
            </button>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{currentCollection.emoji}</span>
              <div className="flex flex-col">
                <span className="text-[10px] tracking-widest text-slate-500 font-mono uppercase">
                  Hydra Collection Bundle
                </span>
                <h2 className="text-xl lg:text-2xl font-black italic tracking-tight text-white mt-0.5">
                  {currentCollection.title}
                </h2>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="w-full py-20 flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-slate-400 font-medium text-sm">Retrieving Franchise Library...</p>
          </div>
        ) : error ? (
          <div className="bg-rose-950/40 border border-rose-800 text-rose-300 p-4 rounded-xl text-center flex items-center justify-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            <span>{error}</span>
          </div>
        ) : (
          <div className="animate-in fade-in duration-500">
            <MediaGrid
              items={collectionItems}
              onSelect={onSelectMedia}
              onLongSelect={onLongSelectMedia}
            />
          </div>
        )}

      </div>
    );
  }

  // Render 2. LIST VIEW (Collections Grid)
  return (
    <div className="max-w-7xl mx-auto py-4 px-4 lg:px-8 space-y-6 animate-in fade-in duration-300">
      
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-4">
        <div className="w-1.5 h-6 bg-red-600 rounded-full" />
        <div className="flex flex-col">
          <span className="text-[10px] tracking-widest text-slate-500 font-mono uppercase">
            Curated Box Sets & Filmographies
          </span>
          <h2 className="text-xl lg:text-2xl font-black italic tracking-tight text-white mt-0.5">
            Hydra Collections
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {curatedCollections.map((col) => (
          <button
            key={col.id}
            onClick={() => navigate(`/collections/${col.id}`)}
            className="relative bg-zinc-900/40 hover:bg-zinc-900/60 border border-zinc-800 hover:border-red-600/50 rounded-2xl p-5 flex items-center gap-4 transition-all duration-300 hover:scale-[1.02] focus:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-red-600 cursor-pointer group"
          >
            <div className="text-4xl filter drop-shadow group-hover:scale-110 transition-transform duration-300">
              {col.emoji}
            </div>
            
            <div className="flex flex-col items-start text-left">
              <span className="text-[9px] tracking-widest text-slate-500 font-mono uppercase">
                {col.type.replace('_', ' ')}
              </span>
              <h3 className="text-base sm:text-lg font-black italic text-slate-200 group-hover:text-white transition-colors mt-0.5">
                {col.title}
              </h3>
            </div>

            <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity">
              <Sparkles className="w-4 h-4 text-red-500" />
            </div>
          </button>
        ))}
      </div>

    </div>
  );
};
