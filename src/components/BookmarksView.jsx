import React, { useState } from 'react';
import { Bookmark, Download, Upload, Trash2, Search, Film, HardDrive, ArrowUp, ArrowDown } from 'lucide-react';
import MediaCard from './MediaCard';
import MediaTableRow from './MediaTableRow';

export default function BookmarksView({
  bookmarks,
  onToggleBookmark,
  onOpenDetails,
  viewMode
}) {
  const [filterQuery, setFilterQuery] = useState('');

  const filteredBookmarks = bookmarks.filter((item) =>
    item.title.toLowerCase().includes(filterQuery.toLowerCase()) ||
    (item.category && item.category.toLowerCase().includes(filterQuery.toLowerCase()))
  );

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(bookmarks, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `mitorrents-bookmarks-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImport = (e) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target.result);
          if (Array.isArray(parsed)) {
            const merged = [...bookmarks];
            parsed.forEach(item => {
              if (item.url && !merged.some(b => b.url === item.url)) {
                merged.push(item);
              }
            });
            localStorage.setItem('atlas_bookmarks', JSON.stringify(merged));
            window.location.reload();
          }
        } catch (err) {
          alert('Invalid JSON file.');
        }
      };
    }
  };

  return (
    <div className="space-y-6 transition-colors duration-200">
      {/* Bookmarks Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            Saved Media Collection ({bookmarks.length})
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Your personal local collection saved in browser memory.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Filter saved..."
              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <button
            onClick={handleExport}
            disabled={bookmarks.length === 0}
            className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-medium flex items-center gap-1.5 transition border border-slate-200 dark:border-slate-700"
            title="Export JSON"
          >
            <Download className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" /> Export
          </button>

          <label className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-medium flex items-center gap-1.5 transition border border-slate-200 dark:border-slate-700 cursor-pointer">
            <Upload className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" /> Import
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>
        </div>
      </div>

      {/* Bookmarks Listing */}
      {bookmarks.length === 0 ? (
        <div className="py-20 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/20">
          <Bookmark className="w-12 h-12 text-slate-400 dark:text-slate-700 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">No saved bookmarks yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Click the bookmark icon on any media card while searching or browsing to save it here for offline reference.
          </p>
        </div>
      ) : filteredBookmarks.length === 0 ? (
        <div className="py-12 text-center text-xs text-slate-500">
          No bookmarks match "{filterQuery}".
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredBookmarks.map((item) => (
            <MediaCard
              key={item.url}
              item={item}
              onOpenDetails={onOpenDetails}
              isBookmarked={true}
              onToggleBookmark={onToggleBookmark}
            />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Title & Details</th>
                <th className="py-3 px-3">Size</th>
                <th className="py-3 px-3">Peers</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookmarks.map((item) => (
                <MediaTableRow
                  key={item.url}
                  item={item}
                  onOpenDetails={onOpenDetails}
                  isBookmarked={true}
                  onToggleBookmark={onToggleBookmark}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
