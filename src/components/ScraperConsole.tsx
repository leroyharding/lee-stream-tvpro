import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Radio, RefreshCw, ArrowLeft, Layers, CheckCircle2, XCircle, Loader2, Play, Search } from 'lucide-react';
import { AppSettings, StreamLink, ScraperThreadStatus, StreamProvider } from '../types';
import { runScrapingEngine } from '../services/scraper';
import { StreamList } from './StreamList';

interface ScraperConsoleProps {
  initialQueryType: 'movie' | 'series';
  initialQueryId: string;
  initialTitle: string;
  settings: AppSettings;
  onLaunchStream: (stream: StreamLink) => void;
  onBack?: () => void;
}

export const ScraperConsole: React.FC<ScraperConsoleProps> = ({
  initialQueryType,
  initialQueryId,
  initialTitle,
  settings,
  onLaunchStream,
  onBack
}) => {
  const [queryType, setQueryType] = useState<'movie' | 'series'>(initialQueryType);
  const [queryId, setQueryId] = useState<string>(initialQueryId);
  const [titleContext, setTitleContext] = useState<string>(initialTitle);

  const [streams, setStreams] = useState<StreamLink[]>([]);
  const [isScraping, setIsScraping] = useState<boolean>(false);
  const [hasScraped, setHasScraped] = useState<boolean>(false);

  // Thread statuses
  const [threadStatuses, setThreadStatuses] = useState<ScraperThreadStatus[]>([
    { provider: 'Torrentio', status: 'idle', streamsFound: 0 },
    { provider: 'NoTorrent', status: 'idle', streamsFound: 0 },
    { provider: 'StreamViX', status: 'idle', streamsFound: 0 },
    { provider: 'HdHub', status: 'idle', streamsFound: 0 },
  ]);

  // Autoplay automation tracking
  const [autoPlayMessage, setAutoPlayMessage] = useState<string>('');
  const [autoPlayCountdown, setAutoPlayCountdown] = useState<number>(0);
  const autoPlayTimerRef = useRef<any>(null);
  const countdownIntervalRef = useRef<any>(null);
  const [hasAutoPlayed, setHasAutoPlayed] = useState<boolean>(false);

  const handleProgress = useCallback((provider: StreamProvider, status: 'querying' | 'success' | 'error', count: number, executionTimeMs?: number) => {
    setThreadStatuses(prev => prev.map(t => {
      if (t.provider === provider) {
        return {
          ...t,
          status,
          streamsFound: count,
          executionTimeMs: executionTimeMs !== undefined ? executionTimeMs : t.executionTimeMs
        };
      }
      return t;
    }));
  }, []);

  const executeScraping = useCallback(async (type: 'movie' | 'series', id: string) => {
    if (!id) return;
    
    // Reset states
    setIsScraping(true);
    setHasScraped(false);
    setStreams([]);
    setHasAutoPlayed(false);
    setAutoPlayMessage('');
    setAutoPlayCountdown(0);
    if (autoPlayTimerRef.current) clearTimeout(autoPlayTimerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

    setThreadStatuses([
      { provider: 'Torrentio', status: 'idle', streamsFound: 0 },
      { provider: 'NoTorrent', status: 'idle', streamsFound: 0 },
      { provider: 'StreamViX', status: 'idle', streamsFound: 0 },
      { provider: 'HdHub', status: 'idle', streamsFound: 0 },
    ]);

    try {
      const results = await runScrapingEngine(type, id, settings, handleProgress);
      setStreams(results);
      setHasScraped(true);
    } catch (err) {
      console.error('Scraping execution error', err);
    } finally {
      setIsScraping(false);
    }
  }, [settings, handleProgress]);

  // Execute once on mount or when initial values change
  useEffect(() => {
    if (initialQueryId) {
      setQueryType(initialQueryType);
      setQueryId(initialQueryId);
      setTitleContext(initialTitle);
      executeScraping(initialQueryType, initialQueryId);
    }
  }, [initialQueryId, initialQueryType, initialTitle, executeScraping]);

  // Hook for automation triggers
  useEffect(() => {
    if (!isScraping && hasScraped && streams.length > 0 && !hasAutoPlayed) {
      
      let targetStream: StreamLink | null = null;
      let reason = '';

      // Rule 1: Auto-Play HdHub (English)
      if (settings.autoPlayHdHubEnglish) {
        const hdhubEng = streams.find(s => 
          s.provider === 'HdHub' && 
          (s.title.toLowerCase().includes('english') || s.title.toLowerCase().includes('eng'))
        );
        if (hdhubEng) {
          targetStream = hdhubEng;
          reason = 'Auto-Play HdHub (English)';
        }
      }

      // Rule 2: Auto-Select 4K
      if (!targetStream && settings.autoSelect4K) {
        const first4K = streams.find(s => s.resolution === '4K');
        if (first4K) {
          targetStream = first4K;
          reason = 'Auto-Select 4K';
        }
      }

      // If rule triggered, start a 3-second countdown
      if (targetStream) {
        setHasAutoPlayed(true);
        setAutoPlayMessage(`Rule Triggered: [${reason}] -> Launching top stream automatically...`);
        setAutoPlayCountdown(3);

        const st = targetStream;

        countdownIntervalRef.current = setInterval(() => {
          setAutoPlayCountdown(prev => {
            if (prev <= 1) {
              clearInterval(countdownIntervalRef.current);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        autoPlayTimerRef.current = setTimeout(() => {
          onLaunchStream(st);
        }, 3000);
      }
    }

    return () => {
      if (autoPlayTimerRef.current) clearTimeout(autoPlayTimerRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [isScraping, hasScraped, streams, settings, hasAutoPlayed, onLaunchStream]);

  const handleCancelAutoplay = () => {
    if (autoPlayTimerRef.current) clearTimeout(autoPlayTimerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    setAutoPlayMessage('');
    setAutoPlayCountdown(0);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (queryId.trim()) {
      setTitleContext(`Manual Scrape: ${queryId}`);
      executeScraping(queryType, queryId.trim());
    }
  };

  // Provider config snippet for info
  const getProviderConfigSnippet = (prov: StreamProvider) => {
    switch (prov) {
      case 'Torrentio':
        return 'Free P2P Multi-Provider';
      case 'NoTorrent':
        return 'Direct HTTP / HLS Scraper';
      case 'StreamViX':
        return 'Direct StreamViX Proxy Enabled';
      case 'HdHub':
        return 'Direct HdHub Encoded Base64';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      
      {/* Top Console Title Banner */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Back to Catalog"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Parallel Scraping Engine
              </h1>
            </div>
            <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
              {titleContext ? `Target: ${titleContext}` : 'Ready to resolve real-time streams'}
            </p>
          </div>
        </div>

        {/* Refresh execution */}
        <button
          onClick={() => executeScraping(queryType, queryId)}
          disabled={isScraping || !queryId}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs border transition-all ${
            isScraping
              ? 'bg-slate-900 text-slate-600 border-slate-800 cursor-not-allowed'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 hover:border-slate-600'
          }`}
        >
          <RefreshCw className={`w-4 h-4 ${isScraping ? 'animate-spin text-red-500' : ''}`} />
          <span>{isScraping ? 'Scraping Threads Active...' : 'Re-run Engine'}</span>
        </button>

      </div>

      {/* Manual Input Tester Form */}
      <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4">
        <form onSubmit={handleManualSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
          
          <div className="w-full sm:w-1/4">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Query Type
            </label>
            <select
              value={queryType}
              onChange={(e) => setQueryType(e.target.value as any)}
              className="w-full bg-slate-900 text-slate-200 text-sm rounded-lg border border-slate-700 px-3 py-2"
            >
              <option value="movie">Movie</option>
              <option value="series">TV Series</option>
            </select>
          </div>

          <div className="w-full sm:w-2/3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Scraper Target ID
            </label>
            <input
              type="text"
              value={queryId}
              onChange={(e) => setQueryId(e.target.value)}
              placeholder={queryType === 'movie' ? 'e.g. tt1234567' : 'e.g. tt1234567:1:1'}
              className="w-full bg-slate-900 text-slate-200 text-sm rounded-lg border border-slate-700 px-3 py-2 focus:outline-none focus:border-red-500 font-mono"
            />
            <span className="text-[10px] text-slate-500 block mt-1">
              Movies require IMDb ID. Series require format <code className="text-slate-400">imdbId:seasonNumber:episodeNumber</code>
            </span>
          </div>

          <button
            type="submit"
            disabled={isScraping || !queryId}
            className="w-full sm:w-auto px-6 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg text-sm shrink-0 transition-colors self-end h-[38px] flex items-center justify-center gap-1.5"
          >
            <Search className="w-4 h-4" />
            <span>Query</span>
          </button>

        </form>
      </div>

      {/* Parallel Multi-Threaded Live Monitor */}
      <div className="space-y-3">
        
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-red-500" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Parallel Thread Execution Monitor
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {threadStatuses.map((th) => {
            
            const isQuerying = th.status === 'querying';
            const isSuccess = th.status === 'success';
            const isError = th.status === 'error';

            return (
              <div
                key={th.provider}
                className={`relative bg-slate-900/90 border rounded-xl p-4 transition-all ${
                  isQuerying 
                    ? 'border-amber-500/50 shadow-md shadow-amber-950/10' 
                    : isSuccess 
                    ? 'border-slate-800' 
                    : isError 
                    ? 'border-rose-950/80 bg-rose-950/10' 
                    : 'border-slate-800/60 opacity-60'
                }`}
              >
                
                {/* Header Row */}
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm text-white">
                    {th.provider}
                  </span>

                  {/* Status Indicator Icon */}
                  {isQuerying && <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />}
                  {isSuccess && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                  {isError && <XCircle className="w-4 h-4 text-rose-500" />}
                  {th.status === 'idle' && <Radio className="w-4 h-4 text-slate-600" />}
                </div>

                {/* Status Subtitle */}
                <div className="text-xs text-slate-400 font-medium flex flex-col gap-0.5">
                  <div>
                    {isQuerying && <span className="text-amber-400 animate-pulse">Pinging Target...</span>}
                    {isSuccess && <span className="text-emerald-400">Resolved {th.streamsFound} streams</span>}
                    {isError && <span className="text-rose-400">Timeout / Filtered</span>}
                    {th.status === 'idle' && <span>Awaiting thread execution</span>}
                  </div>
                  {th.executionTimeMs !== undefined && (
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                      Response: {th.executionTimeMs}ms
                    </div>
                  )}
                </div>

                {/* Provider Config tag */}
                <div className="mt-3 pt-2 border-t border-slate-800/80 text-[10px] text-slate-500 font-mono">
                  {getProviderConfigSnippet(th.provider)}
                </div>

              </div>
            );
          })}
        </div>

      </div>

      {/* Autoplay Intercept Overlay Banner */}
      {autoPlayMessage && (
        <div className="bg-gradient-to-r from-red-950 via-slate-900 to-slate-900 border border-red-500/40 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-red-600/20 flex items-center justify-center shrink-0">
              <Play className="w-4 h-4 text-red-500 animate-pulse fill-current" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">
                {autoPlayMessage}
              </p>
              <p className="text-xs text-slate-400">
                Launching directly in <strong className="text-red-400 text-sm">{autoPlayCountdown}s</strong> to bypass selection.
              </p>
            </div>
          </div>

          <button
            onClick={handleCancelAutoplay}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg border border-slate-700 transition-colors shrink-0"
          >
            Cancel Autoplay
          </button>
        </div>
      )}

      {/* Unified Stream List View */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
            Unified Compiled Stream List
          </h3>

          {isScraping && (
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <Loader2 className="w-3 h-3 animate-spin text-red-500" />
              <span>Aggregating sources...</span>
            </span>
          )}
        </div>

        {/* Master Stream List */}
        <StreamList
          streams={streams}
          onSelectStream={onLaunchStream}
          settings={settings}
        />
      </div>

    </div>
  );
};
