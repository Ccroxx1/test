import React, { useState } from 'react';
import { ArrowUp, ArrowDown, HardDrive, Bookmark, Info, Copy, Check, Film, Magnet, Download, Send, Play, CheckSquare, Square } from 'lucide-react';

export default function MediaTableRow({
  item,
  onOpenDetails,
  isBookmarked,
  onToggleBookmark,
  isSelected,
  onToggleSelect,
  onOpenDispatch,
  onOpenStream
}) {
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

  return (
    <tr
      onClick={() => onOpenDetails(item)}
      className={`group hover:bg-slate-50 dark:hover:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800/60 cursor-pointer transition-colors ${
        isSelected ? 'bg-cyan-50 dark:bg-cyan-950/30 border-l-2 border-l-cyan-500 dark:border-l-cyan-400' : ''
      }`}
    >
      {/* Checkbox */}
      <td className="py-3 pl-4 pr-2 w-8" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => onToggleSelect(item)}
          className={`p-1 rounded transition ${isSelected ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-400 dark:text-slate-600 hover:text-slate-700 dark:hover:text-slate-400'}`}
        >
          {isSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
        </button>
      </td>

      {/* Thumbnail + Title */}
      <td className="py-3 px-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-14 shrink-0 rounded bg-slate-100 dark:bg-slate-950 overflow-hidden relative border border-slate-200 dark:border-slate-800 flex items-center justify-center">
            {item.image ? (
              <img
                src={item.image}
                alt=""
                className="w-full h-full object-cover"
                loading="lazy"
                referrerPolicy="no-referrer"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            ) : (
              <Film className="w-4 h-4 text-slate-400 dark:text-slate-700" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              {item.category && (
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-cyan-800 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-500/20">
                  {item.category}
                </span>
              )}
              {item.quality && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-100 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-700/40">
                  {item.quality}
                </span>
              )}
              {item.year && (
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                  {item.year}
                </span>
              )}
            </div>
            <div className="font-medium text-xs sm:text-sm text-slate-800 dark:text-slate-200 group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-colors line-clamp-2">
              {item.title}
            </div>
          </div>
        </div>
      </td>

      {/* Size */}
      <td className="py-3 px-3 text-xs font-mono text-slate-700 dark:text-slate-300 whitespace-nowrap">
        {item.size}
      </td>

      {/* Seeds & Leechers */}
      <td className="py-3 px-3 text-xs whitespace-nowrap">
        <div className="flex items-center gap-2 font-mono">
          <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-0.5">
            <ArrowUp className="w-3 h-3" />
            {item.seeds}
          </span>
          <span className="text-rose-600 dark:text-rose-400 font-bold flex items-center gap-0.5">
            <ArrowDown className="w-3 h-3" />
            {item.leechers}
          </span>
        </div>
      </td>

      {/* Actions */}
      <td className="py-3 px-4 text-right whitespace-nowrap">
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          {/* Stream Preview */}
          <button
            onClick={() => onOpenStream(item)}
            className="p-1.5 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/50 rounded transition"
            title="Stream & Preview In Browser"
          >
            <Play className="w-3.5 h-3.5" />
          </button>

          {/* Client WebUI Dispatch */}
          <button
            onClick={() => onOpenDispatch(item)}
            className="p-1.5 text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 hover:bg-cyan-50 dark:hover:bg-cyan-950/50 rounded transition"
            title="Send to qBittorrent / Seedbox"
          >
            <Send className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleCopyMagnet}
            className="p-1.5 text-slate-400 hover:text-purple-600 dark:hover:text-purple-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition"
            title={copiedMagnet ? "Magnet Copied!" : "Copy Torrent Magnet Link"}
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
            title="Copy title"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => onToggleBookmark(item)}
            className={`p-1.5 rounded transition ${
              isBookmarked ? 'text-cyan-600 dark:text-cyan-400 bg-cyan-100 dark:bg-cyan-950/50' : 'text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title={isBookmarked ? 'Saved' : 'Bookmark'}
          >
            <Bookmark className="w-3.5 h-3.5" fill={isBookmarked ? 'currentColor' : 'none'} />
          </button>
        </div>
      </td>
    </tr>
  );
}
