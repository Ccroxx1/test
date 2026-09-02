import React, { useEffect, useState } from 'react';
import { X, ArrowUp, ArrowDown, HardDrive, CheckCircle2, ShieldCheck, FileText, Copy, Check, ExternalLink, Bookmark, AlertCircle, Loader2, Magnet, Download, Radio, Hash } from 'lucide-react';

export default function MediaDetailModal({
  item,
  onClose,
  isBookmarked,
  onToggleBookmark
}) {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'torrent', 'files', 'nfo'
  const [copiedTitle, setCopiedTitle] = useState(false);
  const [copiedNfo, setCopiedNfo] = useState(false);
  const [copiedMagnet, setCopiedMagnet] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);

  useEffect(() => {
    if (!item?.url) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    fetch(`/api/details?url=${encodeURIComponent(item.url)}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load details (${res.status})`);
        return res.json();
      })
      .then((data) => {
        if (isMounted) {
          setDetails(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.warn("Details fetch error:", err);
          setError(err.message);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [item?.url]);

  if (!item) return null;

  const magnetUri = details?.magnet || item.magnet || "";
  const torrentUrl = details?.torrent || item.torrent || "";
  const infoHash = details?.infoHash || (magnetUri.match(/btih:([a-fA-F0-9]{40}|[a-zA-Z2-7]{32})/i)?.[1]?.toUpperCase() || "");

  // Parse trackers from magnet
  const trackers = [];
  if (magnetUri) {
    const trMatches = magnetUri.matchAll(/tr=([^&]+)/gi);
    for (const match of trMatches) {
      try {
        trackers.push(decodeURIComponent(match[1]));
      } catch {
        trackers.push(match[1]);
      }
    }
  }

  const handleCopyTitle = () => {
    navigator.clipboard.writeText(details?.title || item.title);
    setCopiedTitle(true);
    setTimeout(() => setCopiedTitle(false), 2000);
  };

  const handleCopyMagnet = () => {
    if (magnetUri) {
      navigator.clipboard.writeText(magnetUri);
      setCopiedMagnet(true);
      setTimeout(() => setCopiedMagnet(false), 2000);
    }
  };

  const handleCopyHash = () => {
    if (infoHash) {
      navigator.clipboard.writeText(infoHash);
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2000);
    }
  };

  const handleDownloadTorrent = () => {
    const dlName = details?.title || item.title;
    const downloadUrl = `/api/download-torrent?name=${encodeURIComponent(dlName)}&url=${encodeURIComponent(torrentUrl)}&magnet=${encodeURIComponent(magnetUri)}`;
    window.location.href = downloadUrl;
  };

  const handleCopyNfo = () => {
    if (details?.metadata) {
      navigator.clipboard.writeText(details.metadata);
      setCopiedNfo(true);
      setTimeout(() => setCopiedNfo(false), 2000);
    }
  };

  const titleText = details?.title || item.title;
  const posterUrl = details?.poster || item.image;
  const tmdbSearchUrl = `https://www.themoviedb.org/search?query=${encodeURIComponent(
    titleText.replace(/\b(19\d{2}|20\d{2}|2160p|1080p|720p|WEB-DL|BluRay|x264|x265|HEVC)\b/gi, '').trim()
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800/80 flex items-start justify-between gap-4 bg-slate-950/50">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              {item.category && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-300">
                  {item.category}
                </span>
              )}
              {item.quality && (
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700">
                  {item.quality}
                </span>
              )}
              {item.year && (
                <span className="text-xs font-medium text-slate-400">
                  {item.year}
                </span>
              )}
              {details?.info?.verified && (
                <span className="text-xs flex items-center gap-1 font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-800/60 px-2 py-0.5 rounded-full">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified Index
                </span>
              )}
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-100 leading-snug">
              {titleText}
            </h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onToggleBookmark(item)}
              className={`p-2 rounded-xl border transition ${
                isBookmarked
                  ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-cyan-300 hover:bg-slate-700'
              }`}
              title={isBookmarked ? 'Remove Bookmark' : 'Save Bookmark'}
            >
              <Bookmark className="w-4 h-4" fill={isBookmarked ? 'currentColor' : 'none'} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-100 hover:bg-slate-700 transition"
              title="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex items-center gap-2 px-5 pt-3 border-b border-slate-800 bg-slate-900/90 text-xs font-medium">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-2.5 px-2 border-b-2 transition ${
              activeTab === 'overview'
                ? 'border-cyan-400 text-cyan-300 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Overview & Torrent
          </button>
          <button
            onClick={() => setActiveTab('files')}
            className={`pb-2.5 px-2 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'files'
                ? 'border-cyan-400 text-cyan-300 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            File List {details?.fileList?.length ? `(${details.fileList.length})` : ''}
          </button>
          <button
            onClick={() => setActiveTab('nfo')}
            className={`pb-2.5 px-2 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'nfo'
                ? 'border-cyan-400 text-cyan-300 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> Technical NFO
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5">
          {loading && (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-3">
              <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
              <p className="text-xs font-medium">Retrieving technical metadata & torrent information...</p>
            </div>
          )}

          {!loading && details?.notice && (
            <div className="p-3 bg-cyan-950/40 border border-cyan-800/60 rounded-xl text-xs text-cyan-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>{details.notice}</span>
            </div>
          )}

          {!loading && (
            <>
              {/* TAB 1: OVERVIEW & TORRENT */}
              {activeTab === 'overview' && (
                <div className="space-y-5">
                  {/* Torrent & Magnet Direct Action Hub */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-950/40 via-slate-900 to-cyan-950/30 border border-purple-800/40 space-y-3.5 shadow-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-purple-900/60 border border-purple-700/50 flex items-center justify-center text-purple-300">
                          <Magnet className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-200">BitTorrent & Magnet Direct Links</h4>
                          <p className="text-[11px] text-slate-400">Launch in client or download raw .torrent file</p>
                        </div>
                      </div>
                      {infoHash && (
                        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-slate-950/80 rounded-lg border border-slate-800 font-mono text-[10px] text-slate-400">
                          <Hash className="w-3 h-3 text-purple-400" />
                          <span className="truncate max-w-[120px]">{infoHash}</span>
                          <button
                            onClick={handleCopyHash}
                            className="hover:text-cyan-300 transition ml-1"
                            title="Copy Info Hash"
                          >
                            {copiedHash ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {magnetUri ? (
                        <a
                          href={magnetUri}
                          className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-purple-500/20 transition"
                        >
                          <Magnet className="w-4 h-4" />
                          Open Magnet Link
                        </a>
                      ) : (
                        <button
                          disabled
                          className="px-4 py-2.5 bg-slate-800 text-slate-500 rounded-xl text-xs font-medium flex items-center justify-center gap-2 cursor-not-allowed"
                        >
                          <Magnet className="w-4 h-4" />
                          Magnet Unavailable
                        </button>
                      )}

                      <button
                        onClick={handleCopyMagnet}
                        disabled={!magnetUri}
                        className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 border border-slate-700 hover:border-purple-500/50 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition"
                      >
                        {copiedMagnet ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        {copiedMagnet ? 'Magnet Copied!' : 'Copy Magnet URI'}
                      </button>

                      <button
                        onClick={handleDownloadTorrent}
                        className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md hover:shadow-cyan-500/20 transition"
                      >
                        <Download className="w-4 h-4" />
                        Download .torrent
                      </button>
                    </div>

                    {/* Trackers list pill toggle */}
                    {trackers.length > 0 && (
                      <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                        <div className="flex items-center gap-1.5 mb-1.5 font-medium text-slate-300">
                          <Radio className="w-3 h-3 text-cyan-400" />
                          <span>Announce Trackers ({trackers.length})</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {trackers.slice(0, 4).map((tr, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded bg-slate-950/70 border border-slate-800 text-[10px] font-mono text-slate-400">
                              {tr.replace(/^udp:\/\//, '').replace(/^http(s)?:\/\//, '').split('/')[0]}
                            </span>
                          ))}
                          {trackers.length > 4 && (
                            <span className="px-1.5 py-0.5 text-[10px] text-slate-500 font-mono">
                              +{trackers.length - 4} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-5">
                    {/* Poster */}
                    {posterUrl && (
                      <div className="sm:w-44 shrink-0 aspect-[2/3] rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shadow-md">
                        <img
                          src={posterUrl}
                          alt={titleText}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      </div>
                    )}

                    {/* Key Attributes */}
                    <div className="flex-1 space-y-4">
                      {/* Metric Badges */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col">
                          <span className="text-[10px] text-slate-500 font-medium">Total Size</span>
                          <span className="text-sm font-bold text-slate-200 mt-0.5">{item.size || details?.info?.Size || '—'}</span>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col">
                          <span className="text-[10px] text-slate-500 font-medium">Seeders</span>
                          <span className="text-sm font-bold text-emerald-400 mt-0.5 flex items-center gap-1">
                            <ArrowUp className="w-3.5 h-3.5" /> {item.seeds || details?.info?.seeds || '0'}
                          </span>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col">
                          <span className="text-[10px] text-slate-500 font-medium">Leechers</span>
                          <span className="text-sm font-bold text-rose-400 mt-0.5 flex items-center gap-1">
                            <ArrowDown className="w-3.5 h-3.5" /> {item.leechers || details?.info?.leechers || '0'}
                          </span>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col">
                          <span className="text-[10px] text-slate-500 font-medium">Completed</span>
                          <span className="text-sm font-bold text-cyan-300 mt-0.5">
                            {details?.info?.completed || 'Verified'}
                          </span>
                        </div>
                      </div>

                      {/* Info Table / Attributes */}
                      <div className="rounded-xl border border-slate-800 overflow-hidden text-xs divide-y divide-slate-800/60 bg-slate-950/40">
                        {details?.info && Object.entries(details.info).map(([k, v]) => {
                          if (['verified', 'seeds', 'leechers', 'completed', 'genres'].includes(k.toLowerCase())) return null;
                          return (
                            <div key={k} className="flex px-3.5 py-2">
                              <span className="w-28 text-slate-400 shrink-0 capitalize">{k}</span>
                              <span className="text-slate-200 font-medium">{String(v)}</span>
                            </div>
                          );
                        })}
                        {details?.info?.genres && (
                          <div className="flex px-3.5 py-2 items-center">
                            <span className="w-28 text-slate-400 shrink-0">Genres</span>
                            <div className="flex gap-1.5 flex-wrap">
                              {details.info.genres.map((g, idx) => (
                                <span key={idx} className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px]">
                                  {g}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* External Search Links */}
                      <div className="flex items-center gap-2 pt-1">
                        <a
                          href={tmdbSearchUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition border border-slate-700"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          Lookup on TMDb
                        </a>
                        <button
                          onClick={handleCopyTitle}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition border border-slate-700"
                        >
                          {copiedTitle ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          {copiedTitle ? 'Copied!' : 'Copy Clean Title'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: FILE LIST */}
              {activeTab === 'files' && (
                <div className="space-y-3">
                  <div className="text-xs font-semibold text-slate-400 flex items-center justify-between">
                    <span>Package Contents</span>
                    <span>{details?.fileList?.length || 0} files</span>
                  </div>
                  {details?.fileList?.length ? (
                    <div className="rounded-xl border border-slate-800 overflow-hidden divide-y divide-slate-800/60 bg-slate-950/40 text-xs">
                      {details.fileList.map((file, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 hover:bg-slate-900/60 transition">
                          <span className="text-slate-300 font-mono break-all pr-4">{file.name}</span>
                          <span className="text-slate-400 font-mono text-[11px] shrink-0 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                            {file.size}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-slate-500 text-xs bg-slate-950/40 rounded-xl border border-slate-800">
                      File listing for this release is packaged inside the archive.
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: NFO METADATA */}
              {activeTab === 'nfo' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400">MediaInfo & Release Notes</span>
                    {details?.metadata && (
                      <button
                        onClick={handleCopyNfo}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs flex items-center gap-1 transition"
                      >
                        {copiedNfo ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedNfo ? 'Copied NFO' : 'Copy Text'}
                      </button>
                    )}
                  </div>
                  {details?.metadata ? (
                    <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-slate-300 overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-72">
                      {details.metadata}
                    </pre>
                  ) : (
                    <div className="p-8 text-center text-slate-500 text-xs bg-slate-950/40 rounded-xl border border-slate-800">
                      Standard release description without custom ASCII NFO block.
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/70 flex items-center justify-between text-xs text-slate-400">
          <span className="truncate max-w-xs sm:max-w-md">
            Source: <code className="text-cyan-400">{details?.source || 'TorrentGalaxy Index'}</code>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-medium transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
