import React, { useState, useEffect } from 'react';
import { Sliders, PlayCircle, Smartphone } from 'lucide-react';
import { AppSettings } from '../types';
import { getPlayerNames } from '../services/playerIntent';
import { DEFAULT_TORRENTIO_CONFIG, DEFAULT_STREAMVIX_CONFIG, DEFAULT_HDHUB_CONFIG } from '../services/settings';

interface SettingsModalProps {
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
  onClose?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onSaveSettings
}) => {
  const [localSettings, setLocalSettings] = useState<AppSettings>({ ...settings });

  // Sync state if prop updates
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleChange = (key: keyof AppSettings, value: any) => {
    const updated = { ...localSettings, [key]: value };
    setLocalSettings(updated);
    onSaveSettings(updated);
  };

  const handleResetScrapers = () => {
    const updated = {
      ...localSettings,
      torrentioConfig: DEFAULT_TORRENTIO_CONFIG,
      streamVixConfig: DEFAULT_STREAMVIX_CONFIG,
      hdHubConfig: DEFAULT_HDHUB_CONFIG,
      enableTorrentio: true,
      enableNoTorrent: true,
      enableStreamVix: true,
      enableHdHub: true
    };
    setLocalSettings(updated);
    onSaveSettings(updated);
  };

  const players = getPlayerNames();

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-8">

      {/* Automation Rules Section */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-6">
        
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="w-10 h-10 rounded-xl bg-red-950 flex items-center justify-center border border-red-800">
            <PlayCircle className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Automation & Autoplay Hooks
            </h2>
            <p className="text-slate-400 text-xs">
              Configure immediate stream routing to minimize interface clicks.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Autoplay HdHub English */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 flex items-start justify-between gap-3">
            <div>
              <label className="text-sm font-bold text-slate-200 block">
                Auto-Play HdHub (English)
              </label>
              <p className="text-xs text-slate-500 mt-0.5">
                Immediately launch the first direct stream with provider 'HdHub' whose filename contains 'english' or 'eng'.
              </p>
            </div>
            <input
              type="checkbox"
              checked={localSettings.autoPlayHdHubEnglish}
              onChange={(e) => handleChange('autoPlayHdHubEnglish', e.target.checked)}
              className="w-5 h-5 rounded border-slate-700 bg-slate-900 text-red-600 focus:ring-red-500 mt-0.5 cursor-pointer"
            />
          </div>

          {/* Auto Select 4K */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 flex items-start justify-between gap-3">
            <div>
              <label className="text-sm font-bold text-slate-200 block">
                Auto-Select 4K
              </label>
              <p className="text-xs text-slate-500 mt-0.5">
                If enabled, trigger playback of the highest-sorted 4K stream automatically if the HdHub rule does not apply.
              </p>
            </div>
            <input
              type="checkbox"
              checked={localSettings.autoSelect4K}
              onChange={(e) => handleChange('autoSelect4K', e.target.checked)}
              className="w-5 h-5 rounded border-slate-700 bg-slate-900 text-red-600 focus:ring-red-500 mt-0.5 cursor-pointer"
            />
          </div>

        </div>

      </div>

      {/* Playback Integrations */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-6">
        
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="w-10 h-10 rounded-xl bg-purple-950 flex items-center justify-center border border-purple-800">
            <Smartphone className="w-5 h-5 text-purple-500" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Playback Routines & Intent Bridge
            </h2>
            <p className="text-slate-400 text-xs">
              Switch between the built-in HTML5 media player and external Android application intents.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Player Execution Mode
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              <button
                type="button"
                onClick={() => handleChange('playerMode', 'builtin')}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  localSettings.playerMode === 'builtin'
                    ? 'bg-purple-950/40 border-purple-500 text-white'
                    : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <span className="font-bold text-sm block">Built-in HTML5 Player</span>
                <span className="text-xs text-slate-500 block mt-1">
                  Loads directly in the browser with built-in HLS.js streaming support.
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleChange('playerMode', 'android_intent')}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  localSettings.playerMode === 'android_intent'
                    ? 'bg-purple-950/40 border-purple-500 text-white'
                    : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <span className="font-bold text-sm block">Native Android Wrapper</span>
                <span className="text-xs text-slate-500 block mt-1">
                  Triggers Kotlin Javascript Bridge to launch specialized external media players.
                </span>
              </button>

            </div>
          </div>

          {/* Target App Package */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Target Android Intent Package
            </label>
            <select
              value={localSettings.targetIntentPackage}
              onChange={(e) => handleChange('targetIntentPackage', e.target.value)}
              className="w-full bg-slate-950 text-slate-200 text-sm rounded-lg border border-slate-700 px-3 py-2 focus:outline-none focus:border-purple-500"
            >
              {Object.entries(players).map(([pkg, name]) => (
                <option key={pkg} value={pkg}>
                  {name} ({pkg === 'default' ? 'ACTION_VIEW' : pkg})
                </option>
              ))}
            </select>
            <span className="text-[10px] text-slate-500 block mt-1">
              Applies URL sanitization (spaces to %20, brackets to %5B/%5D, hashes to %23) and injects browser User-Agent headers.
            </span>
          </div>

        </div>

      </div>

      {/* Active Scraping Sources Toggles */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-6">
        
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="w-10 h-10 rounded-xl bg-red-950 flex items-center justify-center border border-red-800">
            <Sliders className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Active Scraping Sources
            </h2>
            <p className="text-slate-400 text-xs">
              Toggle which remote scrapers are queried during link search runs.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Torrentio */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 flex items-start justify-between gap-3">
            <div>
              <label className="text-sm font-bold text-slate-200 block">
                Torrentio Scraper
              </label>
              <p className="text-xs text-slate-500 mt-0.5">
                Queries P2P torrent cache indexer.
              </p>
            </div>
            <input
              type="checkbox"
              checked={localSettings.enableTorrentio}
              onChange={(e) => handleChange('enableTorrentio', e.target.checked)}
              className="w-5 h-5 rounded border-slate-700 bg-slate-900 text-red-605 focus:ring-red-500 mt-0.5 cursor-pointer"
            />
          </div>

          {/* NoTorrent */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 flex items-start justify-between gap-3">
            <div>
              <label className="text-sm font-bold text-slate-200 block">
                NoTorrent Scraper
              </label>
              <p className="text-xs text-slate-500 mt-0.5">
                Queries direct HTTP/HLS direct-stream indexer.
              </p>
            </div>
            <input
              type="checkbox"
              checked={localSettings.enableNoTorrent}
              onChange={(e) => handleChange('enableNoTorrent', e.target.checked)}
              className="w-5 h-5 rounded border-slate-700 bg-slate-900 text-red-605 focus:ring-red-500 mt-0.5 cursor-pointer"
            />
          </div>

          {/* StreamViX */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 flex items-start justify-between gap-3">
            <div>
              <label className="text-sm font-bold text-slate-200 block">
                StreamViX Scraper
              </label>
              <p className="text-xs text-slate-500 mt-0.5">
                Queries fast StreamViX direct proxy indexer.
              </p>
            </div>
            <input
              type="checkbox"
              checked={localSettings.enableStreamVix}
              onChange={(e) => handleChange('enableStreamVix', e.target.checked)}
              className="w-5 h-5 rounded border-slate-700 bg-slate-900 text-red-605 focus:ring-red-500 mt-0.5 cursor-pointer"
            />
          </div>

          {/* HdHub */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 flex items-start justify-between gap-3">
            <div>
              <label className="text-sm font-bold text-slate-200 block">
                HdHub Scraper
              </label>
              <p className="text-xs text-slate-500 mt-0.5">
                Queries Base64-encoded HdHub direct indexer.
              </p>
            </div>
            <input
              type="checkbox"
              checked={localSettings.enableHdHub}
              onChange={(e) => handleChange('enableHdHub', e.target.checked)}
              className="w-5 h-5 rounded border-slate-700 bg-slate-900 text-red-605 focus:ring-red-500 mt-0.5 cursor-pointer"
            />
          </div>

        </div>

      </div>

      {/* Advanced Scraper Strings Editing */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-6">
        
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center border border-slate-700">
              <Sliders className="w-5 h-5 text-slate-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Advanced Scraper Configuration Segments
              </h2>
              <p className="text-slate-400 text-xs">
                Edit the direct URL segments and encoded configurations sent to remote indexers.
              </p>
            </div>
          </div>

          <button
            onClick={handleResetScrapers}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition-colors shrink-0"
          >
            Reset Defaults
          </button>
        </div>

        <div className="space-y-4">
          
          {/* Torrentio */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Torrentio Providers Config Segment
            </label>
            <input
              type="text"
              value={localSettings.torrentioConfig}
              onChange={(e) => handleChange('torrentioConfig', e.target.value)}
              className="w-full bg-slate-950 text-slate-300 text-xs rounded-lg border border-slate-700 px-3 py-2 font-mono"
            />
            <span className="text-[10px] text-slate-500 block mt-0.5">
              Custom provider segment config.
            </span>
          </div>

          {/* StreamViX */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              StreamViX Encoded Segment
            </label>
            <input
              type="text"
              value={localSettings.streamVixConfig}
              onChange={(e) => handleChange('streamVixConfig', e.target.value)}
              className="w-full bg-slate-950 text-slate-300 text-xs rounded-lg border border-slate-700 px-3 py-2 font-mono"
            />
          </div>

          {/* HdHub */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              HdHub Base64 Segment
            </label>
            <input
              type="text"
              value={localSettings.hdHubConfig}
              onChange={(e) => handleChange('hdHubConfig', e.target.value)}
              className="w-full bg-slate-950 text-slate-300 text-xs rounded-lg border border-slate-700 px-3 py-2 font-mono"
            />
          </div>

        </div>

      </div>

    </div>
  );
};
