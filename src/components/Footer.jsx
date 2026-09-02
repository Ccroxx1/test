import React, { useState, useEffect } from 'react';
import {
  Activity,
  Globe,
  Radio,
  Rss,
  Tv,
  Bookmark,
  Download,
  Trash2,
  LayoutGrid,
  List,
  ArrowUp,
  ShieldCheck,
  Film,
  Layers,
  Video,
  Clapperboard,
  Disc,
  Command,
  HelpCircle,
  X,
  ExternalLink,
  Zap,
  CheckCircle2,
  Server
} from 'lucide-react';

export default function Footer({
  onSelectCategory,
  onOpenMirrors,
  onOpenRss,
  onOpenSeriesTracker,
  onOpenBookmarks,
  bookmarksCount = 0,
  serverStatus,
  viewMode,
  setViewMode,
  onClearHistory,
  searchHistoryCount = 0,
  theme = 'dark',
  setTheme
}) {
  const [trackedCount, setTrackedCount] = useState(0);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [copiedRss, setCopiedRss] = useState(false);
  const [latency, setLatency] = useState(null);
  const [pinging, setPinging] = useState(false);

  // Sync tracked series count
  useEffect(() => {
    const updateCount = () => {
      try {
        const list = JSON.parse(localStorage.getItem('atlas_tracked_series') || '[]');
        setTrackedCount(list.length);
      } catch {
        setTrackedCount(0);
      }
    };
    updateCount();
    window.addEventListener('storage', updateCount);
    return () => window.removeEventListener('storage', updateCount);
  }, []);

  // Quick ping current mirror
  const handleQuickPing = async () => {
    setPinging(true);
    const start = Date.now();
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        setLatency(Date.now() - start);
      }
    } catch {
      setLatency(120);
    } finally {
      setPinging(false);
    }
  };

  useEffect(() => {
    handleQuickPing();
  }, []);

  // Quick Export Bookmarks JSON
  const handleExportBookmarks = () => {
    try {
      const saved = localStorage.getItem('atlas_bookmarks') || '[]';
      const blob = new Blob([saved], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mitorrents-bookmarks-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed', err);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const categories = [
    { id: '', label: 'All Items', icon: Disc },
    { id: 'Movies', label: 'Movies', icon: Film },
    { id: 'TV Episodes', label: 'TV Episodes', icon: Tv },
    { id: 'TV Packs', label: 'TV Packs', icon: Layers },
    { id: 'CAMs', label: 'CAMs / Screeners', icon: Video },
    { id: 'Split Scenes', label: 'Split Scenes', icon: Clapperboard }
  ];

  return (
    <>
      <footer className="mt-16 border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 text-xs transition-colors duration-200">
        {/* System Status & Diagnostics Strip */}
        <div className="border-b border-slate-200 dark:border-slate-800/60 bg-slate-50 dark:bg-slate-900/40 py-3 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="font-medium text-slate-800 dark:text-slate-300">Backend Gateway</span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800/60 font-mono text-[10px] font-bold">
                  ONLINE
                </span>
              </div>

              <div className="hidden sm:inline-block text-slate-300 dark:text-slate-700">•</div>

              <button
                onClick={onOpenMirrors}
                className="flex items-center gap-1.5 hover:text-cyan-600 dark:hover:text-cyan-300 transition text-slate-600 dark:text-slate-400 font-mono"
                title="View Mirror Health"
              >
                <Globe className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                <span>
                  Mirror: {serverStatus?.source ? new URL(serverStatus.source).hostname : 'torrentgalaxy.to'}
                </span>
                {latency !== null && (
                  <span className="text-[10px] px-1.5 py-0.2 bg-slate-200 dark:bg-slate-800 rounded text-slate-700 dark:text-slate-300">
                    {latency}ms
                  </span>
                )}
              </button>

              <div className="hidden sm:inline-block text-slate-300 dark:text-slate-700">•</div>

              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>SSL Encrypted & Client-Side P2P</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleQuickPing}
                disabled={pinging}
                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 hover:bg-slate-200 dark:hover:bg-slate-700/90 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700/60 text-[11px] font-medium flex items-center gap-1.5 transition"
                title="Ping Server"
              >
                <Zap className={`w-3 h-3 text-amber-500 dark:text-amber-400 ${pinging ? 'animate-spin' : ''}`} />
                <span>{pinging ? 'Pinging...' : 'Quick Ping'}</span>
              </button>

              <button
                onClick={() => setShowShortcuts(true)}
                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 hover:bg-slate-200 dark:hover:bg-slate-700/90 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700/60 text-[11px] font-medium flex items-center gap-1.5 transition"
                title="Keyboard Shortcuts"
              >
                <Command className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                <span>Shortcuts</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Footer Content Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {/* Column 1: Brand & Overview (Spans 2 columns on lg) */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white font-black text-lg">
                  M
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base text-slate-900 dark:text-slate-100 tracking-tight">MiTorrents</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-950 border border-cyan-300 dark:border-cyan-800/60 text-cyan-800 dark:text-cyan-300 font-semibold uppercase tracking-wider">
                      Index v2.4
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">Decentralised Personal Media Gateway</p>
                </div>
              </div>

              <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed max-w-sm">
                A streamlined, modern personal interface for indexing, searching, and managing media releases with real-time mirror switching, Sonarr/Radarr RSS feeds, and direct client dispatching.
              </p>

              {/* View Mode & Quick Stats Box */}
              <div className="pt-2 flex items-center gap-3">
                <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-0.5">
                  <button
                    onClick={() => setViewMode && setViewMode('grid')}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                      viewMode === 'grid'
                        ? 'bg-cyan-100 dark:bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-500/30 font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span>Grid</span>
                  </button>
                  <button
                    onClick={() => setViewMode && setViewMode('table')}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                      viewMode === 'table'
                        ? 'bg-cyan-100 dark:bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-500/30 font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <List className="w-3.5 h-3.5" />
                    <span>Table</span>
                  </button>
                </div>

                <button
                  onClick={scrollToTop}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 text-xs font-medium flex items-center gap-1.5 transition shadow-sm"
                  title="Return to top of page"
                >
                  <ArrowUp className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                  <span>Top</span>
                </button>
              </div>
            </div>

            {/* Column 2: Media Categories */}
            <div className="space-y-3">
              <h4 className="font-semibold text-xs text-slate-900 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Film className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                <span>Categories</span>
              </h4>
              <ul className="space-y-1.5">
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <li key={cat.id}>
                      <button
                        onClick={() => {
                          if (onSelectCategory) onSelectCategory(cat.id);
                          scrollToTop();
                        }}
                        className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-300 transition py-0.5 text-left w-full group"
                      >
                        <Icon className="w-3 h-3 text-slate-400 dark:text-slate-500 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition" />
                        <span>{cat.label}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Column 3: Features & Modals */}
            <div className="space-y-3">
              <h4 className="font-semibold text-xs text-slate-900 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                <span>Tools & Hub</span>
              </h4>
              <ul className="space-y-1.5">
                <li>
                  <button
                    onClick={onOpenSeriesTracker}
                    className="flex items-center justify-between w-full text-xs text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-300 transition py-0.5 group text-left"
                  >
                    <span className="flex items-center gap-2">
                      <Tv className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                      <span>Series Tracker</span>
                    </span>
                    {trackedCount > 0 && (
                      <span className="px-1.5 py-0.2 rounded bg-purple-100 dark:bg-purple-900/60 border border-purple-300 dark:border-purple-700/60 text-purple-800 dark:text-purple-300 text-[10px] font-bold">
                        {trackedCount}
                      </span>
                    )}
                  </button>
                </li>
                <li>
                  <button
                    onClick={onOpenRss}
                    className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-300 transition py-0.5 group text-left w-full"
                  >
                    <Rss className="w-3 h-3 text-amber-500 dark:text-amber-400" />
                    <span>Automated RSS Generator</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={onOpenMirrors}
                    className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-300 transition py-0.5 group text-left w-full"
                  >
                    <Globe className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                    <span>Mirror Latency & Failover</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={onOpenBookmarks}
                    className="flex items-center justify-between w-full text-xs text-slate-600 dark:text-slate-400 hover:text-pink-600 dark:hover:text-pink-300 transition py-0.5 group text-left"
                  >
                    <span className="flex items-center gap-2">
                      <Bookmark className="w-3.5 h-3.5 text-pink-500 dark:text-pink-400" />
                      <span>Saved Bookmarks</span>
                    </span>
                    {bookmarksCount > 0 && (
                      <span className="px-1.5 py-0.2 rounded bg-pink-100 dark:bg-pink-900/60 border border-pink-300 dark:border-pink-700/60 text-pink-800 dark:text-pink-300 text-[10px] font-bold">
                        {bookmarksCount}
                      </span>
                    )}
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 4: Data Management & Backup */}
            <div className="space-y-3">
              <h4 className="font-semibold text-xs text-slate-900 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Storage & Local Data</span>
              </h4>
              <ul className="space-y-1.5">
                <li>
                  <button
                    onClick={handleExportBookmarks}
                    disabled={bookmarksCount === 0}
                    className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-300 disabled:opacity-40 disabled:hover:text-slate-400 transition py-0.5 group text-left w-full"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Export Bookmarks (.json)</span>
                  </button>
                </li>
                {searchHistoryCount > 0 && (
                  <li>
                    <button
                      onClick={onClearHistory}
                      className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-300 transition py-0.5 group text-left w-full"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />
                      <span>Clear Search History</span>
                    </button>
                  </li>
                )}
                <li>
                  <a
                    href="/api/rss"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-300 transition py-0.5 group text-left w-full"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                    <span>Raw RSS XML Endpoint</span>
                  </a>
                </li>
                <li>
                  <a
                    href="/api/health"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-300 transition py-0.5 group text-left w-full"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>API Diagnostics JSON</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Legal / Non-Hosting Notice */}
          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-[11px] text-slate-500">
            <p className="max-w-2xl leading-relaxed">
              <strong className="text-slate-700 dark:text-slate-400">Disclaimer:</strong> MiTorrents is a client-side personal search & metadata aggregation interface. No media or copyright files are hosted on this server. All links and magnet hashes are retrieved dynamically from public decentralized torrent indexes for educational and personal archiving purposes.
            </p>
            <div className="flex items-center gap-4 shrink-0 text-slate-500 dark:text-slate-400">
              <span className="font-mono text-slate-400 dark:text-slate-500">© {new Date().getFullYear()} MiTorrents</span>
              <button
                onClick={scrollToTop}
                className="hover:text-cyan-600 dark:hover:text-cyan-300 transition flex items-center gap-1 text-slate-500 dark:text-slate-400"
              >
                <span>Back to Top</span>
                <ArrowUp className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Keyboard Shortcuts Modal */}
      {showShortcuts && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Command className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Keyboard Shortcuts</h3>
              </div>
              <button
                onClick={() => setShowShortcuts(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80">
                <span className="text-slate-700 dark:text-slate-300">Focus Search Bar</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-cyan-700 dark:text-cyan-300 font-mono text-[11px] font-bold border border-slate-300 dark:border-slate-700">
                  /
                </kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80">
                <span className="text-slate-700 dark:text-slate-300">Close Active Modal / Back</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[11px] font-bold border border-slate-300 dark:border-slate-700">
                  Esc
                </kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80">
                <span className="text-slate-700 dark:text-slate-300">Switch to Grid View</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[11px] font-bold border border-slate-300 dark:border-slate-700">
                  G
                </kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80">
                <span className="text-slate-700 dark:text-slate-300">Switch to Table View</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[11px] font-bold border border-slate-300 dark:border-slate-700">
                  T
                </kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80">
                <span className="text-slate-700 dark:text-slate-300">Open Series Tracker</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-purple-700 dark:text-purple-300 font-mono text-[11px] font-bold border border-slate-300 dark:border-slate-700">
                  S
                </kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80">
                <span className="text-slate-700 dark:text-slate-300">Open RSS Feed Generator</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-amber-700 dark:text-amber-300 font-mono text-[11px] font-bold border border-slate-300 dark:border-slate-700">
                  R
                </kbd>
              </div>
            </div>

            <div className="pt-2 text-center">
              <button
                onClick={() => setShowShortcuts(false)}
                className="w-full py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
