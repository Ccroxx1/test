import React, { useState, useEffect } from 'react';
import { Tv, Plus, Trash2, Bell, Check, Film, Search, Sparkles, Radio, X } from 'lucide-react';

export default function SeriesTrackerModal({ isOpen, onClose, onSearchItem, onSearchSeries }) {
  const [seriesList, setSeriesList] = useState(() => {
    try {
      const saved = localStorage.getItem('atlas_tracked_series');
      return saved ? JSON.parse(saved) : [
        { id: 1, name: 'House of the Dragon', season: 'S02', nextEp: 'S02E09 / Pack', status: 'Tracking', lastCheck: 'Today' },
        { id: 2, name: 'The Bear', season: 'S03', nextEp: 'S03 Complete', status: 'Updated', lastCheck: '2 hrs ago' },
        { id: 3, name: 'Severance', season: 'S02', nextEp: 'S02E01', status: 'Tracking', lastCheck: 'Yesterday' }
      ];
    } catch {
      return [];
    }
  });

  const [newSeriesName, setNewSeriesName] = useState('');
  const [newSeason, setNewSeason] = useState('S01');

  useEffect(() => {
    localStorage.setItem('atlas_tracked_series', JSON.stringify(seriesList));
  }, [seriesList]);

  if (!isOpen) return null;

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newSeriesName.trim()) return;

    const newItem = {
      id: Date.now(),
      name: newSeriesName.trim(),
      season: newSeason.trim() || 'S01',
      nextEp: `${newSeason.trim() || 'S01'} Latest Episodes`,
      status: 'Tracking',
      lastCheck: 'Just now'
    };

    setSeriesList([newItem, ...seriesList]);
    setNewSeriesName('');
  };

  const handleRemove = (id) => {
    setSeriesList(seriesList.filter(s => s.id !== id));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-colors duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-pink-100 dark:bg-pink-500/10 border border-pink-300 dark:border-pink-500/30 text-pink-600 dark:text-pink-400">
              <Tv className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
                TV Series & Episode Tracker
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Follow your favorite ongoing shows and get instant release alerts
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Add New Series */}
        <form onSubmit={handleAdd} className="p-4 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 flex gap-2">
          <input
            type="text"
            required
            placeholder="Add TV show name (e.g. The Last of Us, Slow Horses)..."
            value={newSeriesName}
            onChange={(e) => setNewSeriesName(e.target.value)}
            className="flex-1 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-pink-500/50"
          />
          <input
            type="text"
            placeholder="S01"
            value={newSeason}
            onChange={(e) => setNewSeason(e.target.value)}
            className="w-16 px-2 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 text-xs font-mono text-center text-slate-900 dark:text-slate-200 focus:outline-none focus:border-pink-500/50"
          />
          <button
            type="submit"
            className="px-3.5 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold transition flex items-center gap-1 shrink-0 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            Track Show
          </button>
        </form>

        {/* Tracked List */}
        <div className="p-4 space-y-2.5 max-h-[50vh] overflow-y-auto">
          {seriesList.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              No TV series tracked yet. Add your favorite shows above!
            </div>
          ) : (
            seriesList.map((s) => (
              <div
                key={s.id}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 flex items-center justify-between gap-3 transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 rounded-lg bg-pink-100 dark:bg-pink-950/40 border border-pink-200 dark:border-pink-800/40 text-pink-600 dark:text-pink-400">
                    <Film className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-xs text-slate-800 dark:text-slate-200 truncate flex items-center gap-2">
                      <span>{s.name}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-pink-50 dark:bg-slate-800 text-pink-700 dark:text-pink-300 border border-pink-200 dark:border-pink-500/30">
                        {s.season}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-3 mt-0.5">
                      <span>Watching for: <strong className="text-slate-700 dark:text-slate-300">{s.nextEp}</strong></span>
                      <span className="text-emerald-600 dark:text-emerald-400 text-[10px]">● {s.status}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      const searchFn = onSearchItem || onSearchSeries;
                      if (typeof searchFn === 'function') {
                        searchFn(`${s.name} ${s.season}`);
                      }
                      if (onClose) onClose();
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-300 text-xs font-medium flex items-center gap-1 transition"
                    title="Find new episodes"
                  >
                    <Search className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
                    <span>Search</span>
                  </button>
                  <button
                    onClick={() => handleRemove(s.id)}
                    className="p-1.5 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-950/50 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition"
                    title="Remove from tracking"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Bell className="w-4 h-4 text-pink-600 dark:text-pink-400" />
            <span>Synced automatically with local browser storage</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
