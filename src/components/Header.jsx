import React, { useState } from 'react';
import { Search, Radio, Bookmark, LayoutGrid, List, Sparkles, X, History, ExternalLink, Activity, Rss, Tv, Sliders, Sun, Moon } from 'lucide-react';
import Logo from './Logo';

export default function Header({
  searchQuery,
  setSearchQuery,
  onSearch,
  activeTab,
  setActiveTab,
  viewMode,
  setViewMode,
  bookmarksCount,
  serverStatus,
  searchHistory = [],
  onSelectHistory,
  onOpenMirrors,
  onOpenRss,
  onOpenSeriesTracker,
  showFilters,
  setShowFilters,
  theme = 'dark',
  setTheme
}) {
  const [showHistory, setShowHistory] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowHistory(false);
      onSearch(searchQuery.trim());
    }
  };

  const toggleTheme = () => {
    if (setTheme) {
      setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 shrink-0 cursor-pointer group" onClick={() => { setActiveTab('latest'); setSearchQuery(''); }}>
            <Logo className="w-10 h-10 transition group-hover:scale-105" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-slate-900 dark:text-slate-100 tracking-tight">MiTorrents</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-950 border border-cyan-200 dark:border-cyan-800/60 text-cyan-800 dark:text-cyan-300 font-medium hidden xs:inline-block">
                  Personal Index
                </span>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 cursor-pointer hover:text-cyan-600 dark:hover:text-cyan-300 transition" onClick={(e) => { e.stopPropagation(); onOpenMirrors(); }}>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse"></span>
                <span>{(() => {
                  try {
                    return serverStatus?.source ? new URL(serverStatus.source).hostname : 'torrentgalaxy.one';
                  } catch {
                    return serverStatus?.source || 'Mirrors Active';
                  }
                })()}</span>
              </div>
            </div>
          </div>

          {/* Search Form */}
          <div className="flex-1 max-w-xl relative">
            <form onSubmit={handleSubmit} className="relative">
              <div className="relative flex items-center">
                <Search className="absolute left-3.5 w-4 h-4 text-slate-400 dark:text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setShowHistory(true)}
                  placeholder="Search movies, TV shows, seasons (e.g. Dune, House of Dragon)..."
                  className="w-full bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-20 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/60 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-cyan-500/20 transition-all shadow-inner"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-12 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-md transition"
                    title="Clear input"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  type="submit"
                  className="absolute right-1.5 px-3 py-1 bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Search History Dropdown */}
            {showHistory && searchHistory.length > 0 && (
              <div 
                className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-2 z-50 overflow-hidden"
                onMouseLeave={() => setShowHistory(false)}
              >
                <div className="flex items-center justify-between px-2.5 py-1 text-[11px] font-medium text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800/60 mb-1">
                  <span className="flex items-center gap-1"><History className="w-3 h-3" /> Recent Searches</span>
                  <button 
                    onClick={() => setShowHistory(false)} 
                    className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                  >
                    Close
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 p-1 max-h-36 overflow-y-auto">
                  {searchHistory.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        onSelectHistory(item);
                        setShowHistory(false);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/80 hover:bg-cyan-50 dark:hover:bg-cyan-950/60 hover:text-cyan-700 dark:hover:text-cyan-300 border border-slate-200 dark:border-slate-700/60 text-xs text-slate-700 dark:text-slate-300 transition text-left"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Navigation & Tools Switcher */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Filter Toggle */}
            {setShowFilters && (
              <button
                onClick={() => setShowFilters(prev => !prev)}
                className={`p-2 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                  showFilters
                    ? 'bg-cyan-100 dark:bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-500/40'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 border border-transparent'
                }`}
                title="Toggle Advanced Filters & Sorting"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Filters</span>
              </button>
            )}

            {/* RSS Automation Modal Trigger */}
            <button
              onClick={onOpenRss}
              className="p-2 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-300 hover:bg-slate-100 dark:hover:bg-slate-900 transition flex items-center gap-1.5"
              title="Sonarr / Radarr RSS Feeds"
            >
              <Rss className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
              <span className="hidden lg:inline">RSS</span>
            </button>

            {/* Series Tracker Trigger */}
            <button
              onClick={onOpenSeriesTracker}
              className="p-2 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-300 hover:bg-slate-100 dark:hover:bg-slate-900 transition flex items-center gap-1.5"
              title="TV Series Episode Tracker"
            >
              <Tv className="w-3.5 h-3.5 text-purple-500 dark:text-purple-400" />
              <span className="hidden lg:inline">TV Tracker</span>
            </button>

            {/* Mirror Diagnostics Trigger */}
            <button
              onClick={onOpenMirrors}
              className="p-2 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-300 hover:bg-slate-100 dark:hover:bg-slate-900 transition flex items-center gap-1.5"
              title="Mirror Health & Failover Manager"
            >
              <Activity className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
              <span className="hidden lg:inline">Mirrors</span>
            </button>

            <button
              onClick={() => setActiveTab('latest')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                activeTab === 'latest'
                  ? 'bg-slate-200 dark:bg-slate-800 text-cyan-700 dark:text-cyan-300 border border-cyan-400/40 dark:border-cyan-500/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Latest</span>
            </button>

            <button
              onClick={() => setActiveTab('bookmarks')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                activeTab === 'bookmarks'
                  ? 'bg-slate-200 dark:bg-slate-800 text-cyan-700 dark:text-cyan-300 border border-cyan-400/40 dark:border-cyan-500/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Saved</span>
              {bookmarksCount > 0 && (
                <span className="px-1.5 py-0.2 bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 text-[10px] rounded-full font-bold">
                  {bookmarksCount}
                </span>
              )}
            </button>

            <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-1 hidden sm:block"></div>

            {/* View Mode Toggle */}
            <div className="bg-slate-100 dark:bg-slate-900 p-0.5 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition ${viewMode === 'grid' ? 'bg-white dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
                title="Grid Poster View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-md transition ${viewMode === 'table' ? 'bg-white dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
                title="Compact Table View"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Theme Toggle (Light / Dark) */}
            <button
              onClick={toggleTheme}
              className="p-1.5 sm:px-2 sm:py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-300 hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 transition flex items-center gap-1.5"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400 animate-fadeIn" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700 animate-fadeIn" />
              )}
              <span className="hidden xl:inline capitalize text-[11px] font-semibold">{theme === 'dark' ? 'Light' : 'Dark'}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
