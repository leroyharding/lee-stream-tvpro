import React, { useState } from 'react';
import { Search, Film, Tv, Tv2, Radio, Settings, Menu, X, Heart, Download, Compass, Library } from 'lucide-react';
import { AppSettings } from '../types';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onSearch: (query: string) => void;
  settings: AppSettings;
  isTvMode?: boolean;
  isInstallable?: boolean;
  onInstall?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onSearch,
  settings: _settings,
  isTvMode = false,
  isInstallable = false,
  onInstall
}) => {
  const [searchInput, setSearchInput] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onSearch(searchInput.trim());
      onSelectTab('search');
      setMobileMenuOpen(false);
    }
  };

  const navItems = [
    { id: 'home', label: 'Home', icon: Film },
    { id: 'movies', label: 'Movies', icon: Film },
    { id: 'shows', label: 'TV Shows', icon: Tv },
    { id: 'genres', label: 'Genres', icon: Compass },
    { id: 'collections', label: 'Collections', icon: Library },
    { id: 'livetv', label: 'Live TV', icon: Tv2 },
    { id: 'watchlist', label: 'My List', icon: Heart },
    { id: 'scraper', label: 'Scraper Console', icon: Radio },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="sticky top-0 z-50 glass-panel border-b border-slate-800/80 px-4 lg:px-8 py-3 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <button 
          onClick={() => onSelectTab('home')}
          className="flex items-center gap-2.5 group focus:outline-none"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center shadow-lg shadow-red-600/30 group-hover:scale-105 transition-transform">
            <Radio className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div className="flex flex-col items-start">
            <span className="font-black text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              LeeStream<span className="text-red-500">TVPro</span>
            </span>
            <span className="text-[10px] tracking-widest text-slate-400 font-mono -mt-1 uppercase">
              Scraping Engine
            </span>
          </div>
        </button>

        {/* Desktop Navigation Links */}
        <div className={`${isTvMode ? 'flex' : 'hidden md:flex'} items-center gap-1 lg:gap-2`}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive 
                    ? 'bg-slate-800/90 text-red-400 shadow-inner border border-slate-700/50' 
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-red-500' : 'text-slate-400'}`} />
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Search Bar & RD Status */}
        <div className="flex items-center gap-3">
          <form onSubmit={handleSearchSubmit} className={`relative ${isTvMode ? 'block' : 'hidden sm:block'} w-48 lg:w-64`}>
            <input
              type="text"
              placeholder="Search movies & shows..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full bg-slate-900/90 text-slate-200 placeholder-slate-500 text-sm rounded-full pl-9 pr-4 py-1.5 border border-slate-700/60 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </form>

          {/* PWA Install Button */}
          {isInstallable && onInstall && (
            <button
              onClick={onInstall}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black bg-red-650 hover:bg-red-600 text-white border border-red-500 shadow-md shadow-red-900/30 transition-all cursor-pointer focus:outline-none focus:ring-1 focus:ring-red-500 scale-100 hover:scale-105 active:scale-95 animate-pulse"
              title="Install LeeStreamTVPro App"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install</span>
            </button>
          )}



          {/* Mobile Menu Trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`${isTvMode ? 'hidden' : 'md:hidden'} p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60`}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && !isTvMode && (
        <div className="md:hidden mt-3 pt-3 border-t border-slate-800 flex flex-col gap-2 pb-2">
          <form onSubmit={handleSearchSubmit} className="relative w-full mb-2">
            <input
              type="text"
              placeholder="Search catalog..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full bg-slate-900 text-slate-200 placeholder-slate-500 text-sm rounded-lg pl-9 pr-4 py-2 border border-slate-700 focus:outline-none focus:border-red-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </form>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-medium ${
                  isActive 
                    ? 'bg-red-950/40 text-red-400 border-l-4 border-red-500' 
                    : 'text-slate-300 hover:bg-slate-800/40'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-red-500' : 'text-slate-400'}`} />
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </nav>
  );
};
