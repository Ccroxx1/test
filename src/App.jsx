import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Header from './components/Header';
import CategoryFilter from './components/CategoryFilter';
import AdvancedFilterBar from './components/AdvancedFilterBar';
import MediaCard from './components/MediaCard';
import MediaTableRow from './components/MediaTableRow';
import TorrentDetailsPage from './components/TorrentDetailsPage';
import BookmarksView from './components/BookmarksView';
import BatchActionBar from './components/BatchActionBar';
import MirrorStatusModal from './components/MirrorStatusModal';
import RssModal from './components/RssModal';
import ClientDispatchModal from './components/ClientDispatchModal';
import StreamPreviewModal from './components/StreamPreviewModal';
import SeriesTrackerModal from './components/SeriesTrackerModal';
import Footer from './components/Footer';
import { Loader2, AlertCircle, RefreshCw, ChevronLeft, ChevronRight, Sparkles, Film, Database, Sliders } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('latest'); // 'latest', 'search', 'bookmarks'
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearchTerm, setActiveSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [page, setPage] = useState(1);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fallbackNotice, setFallbackNotice] = useState(null);
  const [serverStatus, setServerStatus] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  // Filtering & Sorting State
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('default'); // 'default', 'seeds', 'leechers', 'size', 'name'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' | 'desc'
  const [selectedQuality, setSelectedQuality] = useState('All Qualities');
  const [selectedCodec, setSelectedCodec] = useState('All Codecs');
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  // Batch Multi-Select State
  const [selectedItems, setSelectedItems] = useState([]);

  // Modals
  const [mirrorsModalOpen, setMirrorsModalOpen] = useState(false);
  const [rssModalOpen, setRssModalOpen] = useState(false);
  const [seriesModalOpen, setSeriesModalOpen] = useState(false);
  const [dispatchItem, setDispatchItem] = useState(null);
  const [streamItem, setStreamItem] = useState(null);

  const [bookmarks, setBookmarks] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('atlas_bookmarks') || '[]');
    } catch {
      return [];
    }
  });

  const [searchHistory, setSearchHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('atlas_search_history') || '[]');
    } catch {
      return [];
    }
  });

  // Dual theme state (light / dark)
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('mitorrents_theme') || 'dark';
    } catch {
      return 'dark';
    }
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('mitorrents_theme', theme);
  }, [theme]);

  const handleOpenDetails = useCallback((item) => {
    setSelectedItem(item);
    window.history.pushState({ item }, item.title, `#torrent=${encodeURIComponent(item.title)}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleBackFromDetails = useCallback(() => {
    setSelectedItem(null);
    if (window.location.hash.startsWith('#torrent=')) {
      window.history.pushState(null, '', window.location.pathname);
    }
  }, []);

  // Handle global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore when user is actively typing in an input or textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) {
        if (e.key === 'Escape') {
          e.target.blur();
        }
        return;
      }

      if (e.key === '/') {
        e.preventDefault();
        const searchInput = document.querySelector('input[type="text"]');
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
      } else if (e.key === 'g' || e.key === 'G') {
        setViewMode('grid');
      } else if (e.key === 't' || e.key === 'T') {
        setViewMode('table');
      } else if (e.key === 's' || e.key === 'S') {
        setSeriesModalOpen(true);
      } else if (e.key === 'r' || e.key === 'R') {
        setRssModalOpen(true);
      } else if (e.key === 'Escape') {
        if (selectedItem) {
          handleBackFromDetails();
        } else {
          setMirrorsModalOpen(false);
          setRssModalOpen(false);
          setSeriesModalOpen(false);
          setDispatchItem(null);
          setStreamItem(null);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedItem, handleBackFromDetails]);

  // Handle browser back/forward buttons with History API
  useEffect(() => {
    const handlePopState = (e) => {
      if (e.state && e.state.item) {
        setSelectedItem(e.state.item);
      } else {
        setSelectedItem(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Check backend health on mount
  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => setServerStatus(data))
      .catch(err => console.warn('Health check failed:', err));
  }, []);

  // Sync bookmarks to localStorage
  useEffect(() => {
    localStorage.setItem('atlas_bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  // Sync search history
  useEffect(() => {
    localStorage.setItem('atlas_search_history', JSON.stringify(searchHistory.slice(0, 10)));
  }, [searchHistory]);

  const toggleBookmark = useCallback((item) => {
    setBookmarks(prev => {
      const exists = prev.some(b => b.url === item.url);
      if (exists) {
        return prev.filter(b => b.url !== item.url);
      } else {
        return [item, ...prev];
      }
    });
  }, []);

  const isItemBookmarked = useCallback((item) => {
    return bookmarks.some(b => b.url === item.url);
  }, [bookmarks]);

  // Batch Select Toggle
  const toggleSelectItem = useCallback((item) => {
    setSelectedItems(prev => {
      const exists = prev.some(it => (it.url || it.title) === (item.url || item.title));
      if (exists) {
        return prev.filter(it => (it.url || it.title) !== (item.url || item.title));
      } else {
        return [...prev, item];
      }
    });
  }, []);

  const isItemSelected = useCallback((item) => {
    return selectedItems.some(it => (it.url || it.title) === (item.url || item.title));
  }, [selectedItems]);

  const handleClearSelection = useCallback(() => {
    setSelectedItems([]);
  }, []);

  // Fetch Items logic
  const fetchData = useCallback(async (isSearch = false, query = '', cat = '', pageNum = 1) => {
    setLoading(true);
    setError(null);
    setFallbackNotice(null);

    try {
      let endpoint = '';
      if (isSearch && query.trim()) {
        endpoint = `/api/search?q=${encodeURIComponent(query.trim())}&page=${pageNum}${cat ? `&category=${encodeURIComponent(cat)}` : ''}`;
      } else {
        endpoint = `/api/latest?page=${pageNum}${cat ? `&category=${encodeURIComponent(cat)}` : ''}`;
      }

      const res = await fetch(endpoint);
      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const data = await res.json();
      setItems(data.results || []);
      if (data.notice) {
        setFallbackNotice(data.notice);
      }
    } catch (err) {
      console.warn("Fetch error:", err);
      setError(err.message || 'Unable to retrieve media items.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Effect for triggering latest browse or search
  useEffect(() => {
    if (activeTab === 'latest') {
      fetchData(false, '', selectedCategory, page);
    } else if (activeTab === 'search' && activeSearchTerm) {
      fetchData(true, activeSearchTerm, selectedCategory, page);
    }
  }, [activeTab, activeSearchTerm, selectedCategory, page, fetchData]);

  const handleSearch = (term) => {
    const cleanTerm = term.trim();
    if (!cleanTerm) return;

    setSelectedItem(null);
    setActiveSearchTerm(cleanTerm);
    setSearchQuery(cleanTerm);
    setActiveTab('search');
    setPage(1);

    // Update history
    setSearchHistory(prev => [cleanTerm, ...prev.filter(t => t.toLowerCase() !== cleanTerm.toLowerCase())].slice(0, 10));
  };

  const handleCategorySelect = (catId) => {
    setSelectedItem(null);
    setSelectedCategory(catId);
    setPage(1);
  };

  const parseSizeToMb = (sizeStr) => {
    if (!sizeStr) return 0;
    const str = sizeStr.toString().trim().toUpperCase();
    const match = str.match(/([0-9.]+)\s*(GB|MB|KB|TB)?/);
    if (!match) return 0;
    const val = parseFloat(match[1]) || 0;
    const unit = match[2] || 'MB';
    if (unit === 'TB') return val * 1024 * 1024;
    if (unit === 'GB') return val * 1024;
    if (unit === 'KB') return val / 1024;
    return val;
  };

  // Processed Items with Filtering and Sorting
  const processedItems = useMemo(() => {
    let list = [...items];

    // 1. Verified filter
    if (verifiedOnly) {
      list = list.filter(item => {
        const title = (item.title || '').toLowerCase();
        return title.includes('galaxyrg') || title.includes('verified') || (item.seeds && parseInt(item.seeds, 10) > 100);
      });
    }

    // 2. Quality filter
    if (selectedQuality && selectedQuality !== 'All Qualities') {
      list = list.filter(item => {
        const text = `${item.quality || ''} ${item.title || ''}`.toUpperCase();
        if (selectedQuality === '4K / 2160p') return text.includes('4K') || text.includes('2160P') || text.includes('UHD');
        if (selectedQuality === '1080p') return text.includes('1080P') || text.includes('FHD');
        if (selectedQuality === '720p') return text.includes('720P') || text.includes('HD');
        if (selectedQuality === 'CAM') return text.includes('CAM') || text.includes('TELESYNC') || text.includes('HDCAM');
        return true;
      });
    }

    // 3. Codec filter
    if (selectedCodec && selectedCodec !== 'All Codecs') {
      list = list.filter(item => {
        const text = (item.title || '').toUpperCase();
        if (selectedCodec === 'x265 / HEVC') return text.includes('X265') || text.includes('HEVC') || text.includes('H.265');
        if (selectedCodec === 'x264 / AVC') return text.includes('X264') || text.includes('AVC') || text.includes('H.264');
        if (selectedCodec === '10-Bit') return text.includes('10BIT') || text.includes('10-BIT') || text.includes('HDR');
        if (selectedCodec === 'HDR') return text.includes('HDR') || text.includes('DV') || text.includes('DOLBY');
        return true;
      });
    }

    // 4. Sorting
    if (sortBy === 'seeds') {
      list.sort((a, b) => {
        const sA = parseInt(a.seeds || 0, 10);
        const sB = parseInt(b.seeds || 0, 10);
        return sortOrder === 'desc' ? sB - sA : sA - sB;
      });
    } else if (sortBy === 'leechers') {
      list.sort((a, b) => {
        const lA = parseInt(a.leechers || 0, 10);
        const lB = parseInt(b.leechers || 0, 10);
        return sortOrder === 'desc' ? lB - lA : lA - lB;
      });
    } else if (sortBy === 'size') {
      list.sort((a, b) => {
        const szA = parseSizeToMb(a.size);
        const szB = parseSizeToMb(b.size);
        return sortOrder === 'desc' ? szB - szA : szA - szB;
      });
    } else if (sortBy === 'name') {
      list.sort((a, b) => {
        const tA = (a.title || '').toLowerCase();
        const tB = (b.title || '').toLowerCase();
        return sortOrder === 'desc' ? tB.localeCompare(tA) : tA.localeCompare(tB);
      });
    }

    return list;
  }, [items, verifiedOnly, selectedQuality, selectedCodec, sortBy, sortOrder]);

  const resetFilters = () => {
    setSortBy('default');
    setSortOrder('desc');
    setSelectedQuality('All Qualities');
    setSelectedCodec('All Codecs');
    setVerifiedOnly(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-800 dark:selection:text-cyan-200 transition-colors duration-200">
      {/* Top Sticky Navigation Bar */}
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearch={handleSearch}
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setSelectedItem(null);
          setActiveTab(tab);
          setPage(1);
        }}
        viewMode={viewMode}
        setViewMode={setViewMode}
        bookmarksCount={bookmarks.length}
        serverStatus={serverStatus}
        searchHistory={searchHistory}
        onSelectHistory={handleSearch}
        onOpenMirrors={() => setMirrorsModalOpen(true)}
        onOpenRss={() => setRssModalOpen(true)}
        onOpenSeriesTracker={() => setSeriesModalOpen(true)}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        theme={theme}
        setTheme={setTheme}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Category Filters Bar (for Latest or Search views, hidden on details page) */}
        {!selectedItem && activeTab !== 'bookmarks' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <CategoryFilter
                selectedCategory={selectedCategory}
                onSelectCategory={handleCategorySelect}
              />

              {/* Active Query Status Indicator */}
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 shrink-0">
                {activeTab === 'search' && activeSearchTerm ? (
                  <span>Results for: <strong className="text-cyan-700 dark:text-cyan-300">"{activeSearchTerm}"</strong> ({processedItems.length} items)</span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                    <span>Live Index Stream ({processedItems.length} items)</span>
                  </span>
                )}
              </div>
            </div>

            {/* Collapsible Advanced Multi-Filter / Sort Bar */}
            {showFilters && (
              <AdvancedFilterBar
                sortBy={sortBy}
                setSortBy={setSortBy}
                sortOrder={sortOrder}
                setSortOrder={setSortOrder}
                selectedQuality={selectedQuality}
                setSelectedQuality={setSelectedQuality}
                selectedCodec={selectedCodec}
                setSelectedCodec={setSelectedCodec}
                verifiedOnly={verifiedOnly}
                setVerifiedOnly={setVerifiedOnly}
                onResetFilters={resetFilters}
              />
            )}
          </div>
        )}

        {/* Fallback Notice Banner */}
        {!selectedItem && fallbackNotice && (
          <div className="p-3.5 rounded-2xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800/60 text-xs text-cyan-900 dark:text-cyan-200 flex items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
              <span>{fallbackNotice}</span>
            </div>
            <button
              onClick={() => fetchData(activeTab === 'search', activeSearchTerm, selectedCategory, page)}
              className="px-2.5 py-1 rounded-lg bg-cyan-100 dark:bg-cyan-900/60 hover:bg-cyan-200 dark:hover:bg-cyan-800 text-cyan-900 dark:text-cyan-200 text-[11px] font-medium transition shrink-0 flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> Retry Live
            </button>
          </div>
        )}

        {/* Content Views */}
        {selectedItem ? (
          <TorrentDetailsPage
            item={selectedItem}
            onBack={handleBackFromDetails}
            isBookmarked={isItemBookmarked(selectedItem)}
            onToggleBookmark={toggleBookmark}
            onOpenDispatch={(it) => setDispatchItem(it)}
            onOpenStream={(it) => setStreamItem(it)}
          />
        ) : activeTab === 'bookmarks' ? (
          <BookmarksView
            bookmarks={bookmarks}
            onToggleBookmark={toggleBookmark}
            onOpenDetails={handleOpenDetails}
            viewMode={viewMode}
          />
        ) : loading ? (
          <div className="py-28 flex flex-col items-center justify-center gap-4 text-slate-400">
            <Loader2 className="w-9 h-9 text-cyan-600 dark:text-cyan-400 animate-spin" />
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Querying {activeTab === 'search' ? `"${activeSearchTerm}"` : 'public metadata index'}...
            </p>
          </div>
        ) : error ? (
          <div className="py-20 text-center rounded-2xl border border-dashed border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/20 p-6 space-y-3">
            <AlertCircle className="w-10 h-10 text-rose-500 dark:text-rose-400 mx-auto" />
            <h3 className="text-sm font-semibold text-rose-800 dark:text-rose-200">Unable to load media entries</h3>
            <p className="text-xs text-rose-600 dark:text-rose-300 max-w-md mx-auto">{error}</p>
            <button
              onClick={() => fetchData(activeTab === 'search', activeSearchTerm, selectedCategory, page)}
              className="mt-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-medium transition"
            >
              Retry Connection
            </button>
          </div>
        ) : processedItems.length === 0 ? (
          <div className="py-20 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/30 p-6 space-y-3">
            <Film className="w-10 h-10 text-slate-400 dark:text-slate-600 mx-auto" />
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">No media entries found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {activeTab === 'search'
                ? `No releases matched "${activeSearchTerm}" with current filters. Try resetting filters or changing terms.`
                : 'No releases available in this category with current filters.'}
            </p>
            <button
              onClick={resetFilters}
              className="mt-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs text-cyan-700 dark:text-cyan-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Grid vs Table View Rendering */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {processedItems.map((item, idx) => (
                  <MediaCard
                    key={item.url || idx}
                    item={item}
                    onOpenDetails={handleOpenDetails}
                    isBookmarked={isItemBookmarked(item)}
                    onToggleBookmark={toggleBookmark}
                    isSelected={isItemSelected(item)}
                    onToggleSelect={toggleSelectItem}
                    onOpenDispatch={(it) => setDispatchItem(it)}
                    onOpenStream={(it) => setStreamItem(it)}
                  />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xl">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      <th className="py-3 pl-4 pr-2 w-8">
                        <span className="sr-only">Select</span>
                      </th>
                      <th className="py-3 px-2">Title & Details</th>
                      <th className="py-3 px-3">Size</th>
                      <th className="py-3 px-3">Peers</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {processedItems.map((item, idx) => (
                      <MediaTableRow
                        key={item.url || idx}
                        item={item}
                        onOpenDetails={handleOpenDetails}
                        isBookmarked={isItemBookmarked(item)}
                        onToggleBookmark={toggleBookmark}
                        isSelected={isItemSelected(item)}
                        onToggleSelect={toggleSelectItem}
                        onOpenDispatch={(it) => setDispatchItem(it)}
                        onOpenStream={(it) => setStreamItem(it)}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800/80 text-xs text-slate-600 dark:text-slate-400">
              <span>Page <strong className="text-slate-900 dark:text-slate-200">{page}</strong></span>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => {
                    setPage(p => Math.max(1, p - 1));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 transition flex items-center gap-1 shadow-sm"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Previous
                </button>
                <button
                  onClick={() => {
                    setPage(p => p + 1);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 transition flex items-center gap-1 shadow-sm"
                >
                  Next <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Floating Bottom Batch Action Bar */}
      <BatchActionBar
        selectedItems={selectedItems}
        onClearSelection={handleClearSelection}
        onOpenDetails={handleOpenDetails}
      />

      {/* Feature Modals */}
      <MirrorStatusModal
        isOpen={mirrorsModalOpen}
        onClose={() => setMirrorsModalOpen(false)}
        onMirrorSwitched={(url) => {
          setServerStatus(prev => ({ ...prev, source: url }));
          fetchData(activeTab === 'search', activeSearchTerm, selectedCategory, page);
        }}
      />

      <RssModal
        isOpen={rssModalOpen}
        onClose={() => setRssModalOpen(false)}
      />

      <SeriesTrackerModal
        isOpen={seriesModalOpen}
        onClose={() => setSeriesModalOpen(false)}
        onSearchItem={(query) => {
          handleSearch(query);
        }}
        onSearchSeries={(query) => {
          handleSearch(query);
        }}
      />

      <ClientDispatchModal
        isOpen={!!dispatchItem}
        onClose={() => setDispatchItem(null)}
        item={dispatchItem}
      />

      <StreamPreviewModal
        isOpen={!!streamItem}
        onClose={() => setStreamItem(null)}
        item={streamItem}
      />

      {/* Comprehensive Feature-Rich Footer */}
      <Footer
        onSelectCategory={(catId) => {
          handleCategorySelect(catId);
          setActiveTab('latest');
        }}
        onOpenMirrors={() => setMirrorsModalOpen(true)}
        onOpenRss={() => setRssModalOpen(true)}
        onOpenSeriesTracker={() => setSeriesModalOpen(true)}
        onOpenBookmarks={() => {
          setSelectedItem(null);
          setActiveTab('bookmarks');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        bookmarksCount={bookmarks.length}
        serverStatus={serverStatus}
        viewMode={viewMode}
        setViewMode={setViewMode}
        onClearHistory={() => setSearchHistory([])}
        searchHistoryCount={searchHistory.length}
        theme={theme}
        setTheme={setTheme}
      />
    </div>
  );
}
