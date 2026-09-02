import React from 'react';
import { Filter, ArrowUpDown, Sparkles, CheckCircle2, ShieldCheck, Film } from 'lucide-react';

export default function AdvancedFilterBar({
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  selectedQuality,
  setSelectedQuality,
  selectedCodec,
  setSelectedCodec,
  verifiedOnly,
  setVerifiedOnly,
  onResetFilters
}) {
  const qualities = ['All Qualities', '4K / 2160p', '1080p', '720p', 'CAM'];
  const codecs = ['All Codecs', 'x265 / HEVC', 'x264 / AVC', '10-Bit', 'HDR'];

  const hasActiveFilters = sortBy !== 'default' || selectedQuality !== 'All Qualities' || selectedCodec !== 'All Codecs' || verifiedOnly;

  return (
    <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800/90 shadow-md space-y-3 transition-colors duration-200">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Sort Controls */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="text-slate-600 dark:text-slate-400 font-semibold flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            Sort by:
          </span>
          {[
            { id: 'default', label: 'Default' },
            { id: 'seeds', label: 'Most Seeds' },
            { id: 'leechers', label: 'Leechers' },
            { id: 'size', label: 'File Size' },
            { id: 'name', label: 'Title (A-Z)' }
          ].map(s => (
            <button
              key={s.id}
              onClick={() => setSortBy(s.id)}
              className={`px-2.5 py-1 rounded-lg border transition font-medium ${
                sortBy === s.id
                  ? 'bg-cyan-50 dark:bg-cyan-500/20 border-cyan-400 dark:border-cyan-500/50 text-cyan-700 dark:text-cyan-300 font-bold'
                  : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900'
              }`}
            >
              {s.label}
            </button>
          ))}

          {sortBy !== 'default' && (
            <button
              onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
              className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono text-[11px] border border-slate-300 dark:border-slate-700"
              title="Toggle sort direction"
            >
              {sortOrder === 'desc' ? '▼ Descending' : '▲ Ascending'}
            </button>
          )}
        </div>

        {/* Verified Only Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setVerifiedOnly(prev => !prev)}
            className={`px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition border ${
              verifiedOnly
                ? 'bg-emerald-50 dark:bg-emerald-500/20 border-emerald-400 dark:border-emerald-500/50 text-emerald-700 dark:text-emerald-300 shadow-sm'
                : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Verified Uploaders Only (GalaxyRG)</span>
          </button>

          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              className="px-2.5 py-1 rounded-lg text-xs text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Quality and Codec Pills */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/60 text-xs">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-slate-500 dark:text-slate-400 text-[11px] font-medium mr-1">Quality:</span>
          {qualities.map(q => (
            <button
              key={q}
              onClick={() => setSelectedQuality(q)}
              className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition border ${
                selectedQuality === q
                  ? 'bg-amber-50 dark:bg-amber-500/20 border-amber-400 dark:border-amber-500/50 text-amber-700 dark:text-amber-300 font-bold'
                  : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {q}
            </button>
          ))}
        </div>

        <div className="h-3 w-px bg-slate-200 dark:bg-slate-800 mx-2 hidden sm:block"></div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-slate-500 dark:text-slate-400 text-[11px] font-medium mr-1">Codec:</span>
          {codecs.map(c => (
            <button
              key={c}
              onClick={() => setSelectedCodec(c)}
              className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition border ${
                selectedCodec === c
                  ? 'bg-purple-50 dark:bg-purple-500/20 border-purple-400 dark:border-purple-500/50 text-purple-700 dark:text-purple-300 font-bold'
                  : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
