import React, { useState } from 'react';
import { ArrowUp, ArrowDown, HardDrive, Bookmark, Info, Film, Copy, Check, Magnet, Download, Send, Play, CheckSquare, Square } from 'lucide-react';

export default function MediaCard({
  item,
  onOpenDetails,
  isBookmarked,
  onToggleBookmark,
  isSelected,
  onToggleSelect,
  onOpenDispatch,
  onOpenStream
}) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedMagnet, setCopiedMagnet] = useState(false);

  const handleCopyTitle = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(item.title);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyMagnet = (e) => {
    e.stopPropagation();
    if (item.magnet) {
      navigator.clipboard.writeText(item.magnet);
      setCopiedMagnet(true);
      setTimeout(() => setCopiedMagnet(false), 2000);
    } else {
      onOpenDetails(item);
    }
  };

  const handleDownloadTorrent = (e) => {
    e.stopPropagation();
    if (item.torrent || item.magnet) {
      const downloadUrl = `/api/download-torrent?name=${encodeURIComponent(item.title)}&url=${encodeURIComponent(item.torrent || '')}&magnet=${encodeURIComponent(item.magnet || '')}`;
      window.location.href = downloadUrl;
    } else {
      onOpenDetails(item);
    }
  };

  const getQualityColor = (quality) => {
    if (!quality) return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700';
    const q = quality.toUpperCase();
    if (q.includes('4K') || q.includes('2160P')) return 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-500/40';
    if (q.includes('1080P')) return 'bg-cyan-100 dark:bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 border-cyan-300 dark:border-cyan-500/40';
    if (q.includes('720P')) return 'bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-500/40';
    if (q.includes('CAM')) return 'bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-500/40';
    return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700';
  };

  return (
    <div
      onClick={() => onOpenDetails(item)}
      className={`group bg-white dark:bg-slate-900/70 hover:bg-slate-50 dark:hover:bg-slate-900 border rounded-2xl overflow-hidden shadow-sm hover:shadow-md dark:shadow-lg transition-all duration-300 flex flex-col cursor-pointer transform hover:-translate-y-1 relative ${
        isSelected
          ? 'border-cyan-500 dark:border-cyan-400 ring-2 ring-cyan-500/30 shadow-cyan-500/10'
          : 'border-slate-200 dark:border-slate-800/80 hover:border-cyan-500/40 hover:shadow-cyan-500/10'
      }`}
    >
      {/* Poster Image Container */}
      <div className="relative aspect-[16/10] sm:aspect-[4/3] bg-slate-100 dark:bg-slate-950 overflow-hidden">
        {item.image && !imageError ? (
          <>
            <img
              src={item.image}
              alt={item.title}
              loading="lazy"
              referrerPolicy="no-referrer"
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            />
            {!imageLoaded && (
              <div className="absolute inset-0 bg-slate-200 dark:bg-slate-900/60 animate-pulse flex items-center justify-center">
                <Film className="w-8 h-8 text-slate-400 dark:text-slate-700" />
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-100 via-slate-200 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex flex-col items-center justify-center p-4 text-center">
            <Film className="w-10 h-10 text-slate-400 dark:text-slate-700 mb-2" />
            <span className="text-[11px] text-slate-500 line-clamp-2 px-2 font-medium">
              {item.category || 'Media Item'}
            </span>
          </div>
        )}

        {/* Gradient overlay for title readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-80" />

        {/* Top Badges & Select Box */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1.5 pointer-events-none">
          <div className="flex items-center gap-1.5 flex-wrap pointer-events-auto">
            {/* Batch Select Checkbox */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onToggleSelect) onToggleSelect(item);
              }}
              className={`p-1 rounded-lg backdrop-blur-md transition ${
                isSelected
                  ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                  : 'bg-slate-900/80 text-slate-300 hover:text-cyan-300 hover:bg-slate-900'
              }`}
              title={isSelected ? 'Deselect item' : 'Select for batch action'}
            >
              {isSelected ? <CheckSquare className="w-4 h-4 text-slate-950" /> : <Square className="w-4 h-4" />}
            </button>

            {item.quality && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getQualityColor(item.quality)}`}>
                {item.quality}
              </span>
            )}
            {item.year && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-950/80 text-slate-300 border border-slate-700/60 backdrop-blur-xs">
                {item.year}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 pointer-events-auto">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleBookmark(item);
              }}
              className={`p-1.5 rounded-lg backdrop-blur-md transition ${
                isBookmarked
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'bg-slate-950/70 text-slate-300 hover:text-cyan-300 hover:bg-slate-900'
              }`}
              title={isBookmarked ? 'Remove from Saved' : 'Save bookmark'}
            >
              <Bookmark className="w-3.5 h-3.5" fill={isBookmarked ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>

        {/* Category Pill at bottom of image */}
        {item.category && (
          <div className="absolute bottom-2.5 left-2.5">
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-950/80 text-cyan-300 border border-cyan-500/30 backdrop-blur-xs">
              {item.category}
            </span>
          </div>
        )}
      </div>

      {/* Content Body */}
      <div className="p-4 flex-1 flex flex-col justify-between gap-3">
        <div>
          <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100 group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-colors line-clamp-2 leading-snug">
            {item.title}
          </h3>
        </div>

        {/* Metrics & Action Bar */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
              <HardDrive className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              {item.size}
            </span>
            <div className="flex items-center gap-2 text-[11px]">
              <span className="flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 font-bold" title="Seeders">
                <ArrowUp className="w-3 h-3" />
                {item.seeds}
              </span>
              <span className="flex items-center gap-0.5 text-rose-600 dark:text-rose-400 font-bold" title="Leechers">
                <ArrowDown className="w-3 h-3" />
                {item.leechers}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            {/* Instant Stream Preview */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onOpenStream) onOpenStream(item);
              }}
              className="p-1.5 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/50 rounded transition"
              title="Stream & Preview In Browser"
            >
              <Play className="w-3.5 h-3.5" />
            </button>

            {/* Send to Client WebUI */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onOpenDispatch) onOpenDispatch(item);
              }}
              className="p-1.5 text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 hover:bg-cyan-50 dark:hover:bg-cyan-950/50 rounded transition"
              title="Send to qBittorrent / Seedbox WebUI"
            >
              <Send className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleCopyMagnet}
              className="p-1.5 text-slate-400 hover:text-purple-600 dark:hover:text-purple-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition"
              title={copiedMagnet ? "Magnet Copied!" : "Copy Torrent Magnet URI"}
            >
              {copiedMagnet ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Magnet className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={handleDownloadTorrent}
              className="p-1.5 text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition"
              title="Download .torrent File"
            >
              <Download className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleCopyTitle}
              className="p-1.5 text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition"
              title="Copy clean title"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
