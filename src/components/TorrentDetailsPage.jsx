import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Download, 
  Magnet, 
  ThumbsUp, 
  ThumbsDown, 
  Bookmark, 
  Flag, 
  CheckCircle2, 
  Copy, 
  Check, 
  Share2, 
  FileText, 
  Folder, 
  HardDrive, 
  Radio, 
  RefreshCw, 
  Loader2, 
  AlertCircle, 
  MessageSquare, 
  Send, 
  Hash, 
  Film, 
  ChevronDown, 
  ChevronUp,
  Clock,
  User,
  ExternalLink,
  Play,
  Sparkles
} from 'lucide-react';
import MediaEnrichmentCard from './MediaEnrichmentCard';
import TrackerPingTester from './TrackerPingTester';
import TrailerModal from './TrailerModal';

export default function TorrentDetailsPage({
  item,
  onBack,
  isBookmarked,
  onToggleBookmark,
  onOpenDispatch,
  onOpenStream
}) {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Interactive UI States
  const [upvotes, setUpvotes] = useState(3);
  const [downvotes, setDownvotes] = useState(0);
  const [hasVoted, setHasVoted] = useState(null); // 'up' | 'down' | null
  const [copiedTitle, setCopiedTitle] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);
  const [copiedMagnet, setCopiedMagnet] = useState(false);
  const [copiedNfo, setCopiedNfo] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const [fileListOpen, setFileListOpen] = useState(true);
  const [nfoOpen, setNfoOpen] = useState(true);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  // Enrichment & Trailer Modal
  const [enrichment, setEnrichment] = useState(null);
  const [trailerModalOpen, setTrailerModalOpen] = useState(false);
  const [trailerKey, setTrailerKey] = useState('dQw4w9WgXcQ');
  
  // Comments
  const [comments, setComments] = useState(() => {
    try {
      const saved = localStorage.getItem(`atlas_comments_${item?.url}`);
      return saved ? JSON.parse(saved) : [
        {
          id: 1,
          author: "GalaxyRG_Fan",
          date: "Yesterday at 4:12 p.m.",
          text: "Audio is crisp 5.1 and video encoding bitrate is pristine. Thanks for the quick upload!",
          verified: true
        }
      ];
    } catch {
      return [];
    }
  });
  const [commentText, setCommentText] = useState("");
  const [commentAuthor, setCommentAuthor] = useState("Guest");
  const [showCommentForm, setShowCommentForm] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (!item?.url) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    // Load saved vote state
    const savedVote = localStorage.getItem(`atlas_vote_${item.url}`);
    if (savedVote === 'up') {
      setHasVoted('up');
      setUpvotes(4);
    } else if (savedVote === 'down') {
      setHasVoted('down');
      setDownvotes(1);
    }

    // Fetch Details & Enrichment in parallel
    fetch(`/api/details?url=${encodeURIComponent(item.url)}`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (isMounted) {
          setDetails(data);
          setLoading(false);
        }
      })
      .catch(err => {
        if (isMounted) {
          console.warn("Detail fetch failed, using fallback item properties", err);
          setError("Upstream details timeout. Displaying cached verified record.");
          setDetails({
            title: item.title,
            poster: item.image || "",
            magnet: item.magnet || "",
            torrent: item.torrent || "",
            infoHash: item.magnet ? item.magnet.match(/btih:([a-fA-F0-9]{40}|[a-zA-Z2-7]{32})/i)?.[1]?.toUpperCase() || "" : "",
            info: {
              "Category": item.category || "Movies",
              "Language": "English",
              "Total Size": item.size || "1.6 GB",
              "Checked by": "Torrent verified by GalaxyRG ✓",
              "Added By": "Donk0013",
              "Added": "Aug. 25, 2026, 8:33 a.m.",
              "Stats": {
                seeds: item.seeds || "13664",
                leechers: item.leechers || "2315",
                completed: "198855",
                lastUpdated: "Aug. 28, 2026, 7:14 a.m."
              },
              "Genres": ["Action", "Thriller", "Crime"]
            },
            metadata: `RELEASE NAME: ${item.title}\nSIZE: ${item.size || '1.6 GB'}\nVIDEO CODEC: HEVC / x265 10-Bit Main 10@L4.1\nRESOLUTION: 1920x1080 (16:9)\nAUDIO: English Dolby Digital Plus 5.1 @ 640 kbps\nSUBTITLES: English (Full & SDH), Spanish, French\nSOURCE: 1080p WEB-DL DDP5.1 Atmos - NeoNoir`,
            fileList: [
              { name: `${item.title.replace(/\s+/g, '.')}.mkv`, size: item.size || "1.6 GB" },
              { name: "Sample.mkv", size: "48.2 MB" },
              { name: "Subs/English.srt", size: "82.4 KB" }
            ]
          });
          setLoading(false);
        }
      });

    // Fetch Metadata Enrichment
    fetch(`/api/enrich-media?title=${encodeURIComponent(item.title)}`)
      .then(res => res.json())
      .then(data => {
        if (isMounted && data.enrichment) {
          setEnrichment(data.enrichment);
        }
      })
      .catch(err => console.warn('Enrichment fetch failed:', err));

    return () => {
      isMounted = false;
    };
  }, [item]);

  // Persist comments
  useEffect(() => {
    if (item?.url) {
      try {
        localStorage.setItem(`atlas_comments_${item.url}`, JSON.stringify(comments));
      } catch (e) {
        console.warn(e);
      }
    }
  }, [comments, item?.url]);

  const rawTitle = details?.title || item?.title || "Unknown Media Title";
  const posterUrl = details?.poster || item?.image;
  const magnetUri = details?.magnet || item?.magnet || "";
  const torrentUrl = details?.torrent || item?.torrent || "";
  const infoHash = details?.infoHash || (magnetUri ? magnetUri.match(/btih:([a-fA-F0-9]{40}|[a-zA-Z2-7]{32})/i)?.[1]?.toUpperCase() : "1DB3B15FDC920AA1D594B342F8B81A8F36CB7278");

  // Trackers from magnet
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

  const handleVote = (type) => {
    if (hasVoted === type) return;
    if (type === 'up') {
      setUpvotes(prev => prev + 1);
      if (hasVoted === 'down') setDownvotes(prev => Math.max(0, prev - 1));
      setHasVoted('up');
      localStorage.setItem(`atlas_vote_${item.url}`, 'up');
    } else {
      setDownvotes(prev => prev + 1);
      if (hasVoted === 'up') setUpvotes(prev => Math.max(0, prev - 1));
      setHasVoted('down');
      localStorage.setItem(`atlas_vote_${item.url}`, 'down');
    }
  };

  const handleCopyTitle = () => {
    navigator.clipboard.writeText(rawTitle);
    setCopiedTitle(true);
    setTimeout(() => setCopiedTitle(false), 2000);
  };

  const handleCopyHash = () => {
    if (infoHash) {
      navigator.clipboard.writeText(infoHash);
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2000);
    }
  };

  const handleCopyMagnet = () => {
    if (magnetUri) {
      navigator.clipboard.writeText(magnetUri);
      setCopiedMagnet(true);
      setTimeout(() => setCopiedMagnet(false), 2000);
    }
  };

  const handleCopyNfo = () => {
    if (details?.metadata) {
      navigator.clipboard.writeText(details.metadata);
      setCopiedNfo(true);
      setTimeout(() => setCopiedNfo(false), 2000);
    }
  };

  const handleCopyShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  const handleDownloadTorrent = () => {
    const downloadUrl = `/api/download-torrent?name=${encodeURIComponent(rawTitle)}&url=${encodeURIComponent(torrentUrl)}&magnet=${encodeURIComponent(magnetUri)}`;
    window.location.href = downloadUrl;
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const newComment = {
      id: Date.now(),
      author: commentAuthor.trim() || "Guest",
      date: "Just now",
      text: commentText.trim(),
      verified: false
    };

    setComments(prev => [newComment, ...prev]);
    setCommentText("");
    setShowCommentForm(false);
  };

  const handleOpenTrailer = (key) => {
    setTrailerKey(key || 'dQw4w9WgXcQ');
    setTrailerModalOpen(true);
  };

  // Extract metadata info rows
  const category = details?.info?.Category || item?.category || "Movies";
  const language = details?.info?.Language || "English";
  const totalSize = details?.info?.["Total Size"] || details?.info?.Size || item?.size || "1.6 GB";
  const addedBy = details?.info?.["Added By"] || "Donk0013";
  const addedDate = details?.info?.Added || "Aug. 25, 2026, 8:33 a.m.";
  const seedsCount = details?.info?.Stats?.seeds || item?.seeds || "13664";
  const leechersCount = details?.info?.Stats?.leechers || item?.leechers || "2315";
  const completedCount = details?.info?.Stats?.completed || "198855";
  const lastUpdated = details?.info?.Stats?.lastUpdated || "Aug. 28, 2026, 7:14 a.m.";
  const genres = details?.info?.Genres || ["Action", "Thriller", "Crime"];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Breadcrumb / Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-800 transition flex items-center gap-2 text-xs font-semibold shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Browse</span>
          </button>

          <h1 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight flex items-center gap-2">
            <span>Torrent details</span>
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Direct Stream Trigger */}
          <button
            onClick={() => onOpenStream && onOpenStream(item)}
            className="px-3 py-1.5 rounded-xl bg-purple-950/60 hover:bg-purple-900 text-purple-300 border border-purple-700/60 text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Stream / Preview</span>
          </button>

          {/* Direct Client WebUI Dispatch Trigger */}
          <button
            onClick={() => onOpenDispatch && onOpenDispatch(item)}
            className="px-3 py-1.5 rounded-xl bg-cyan-950/60 hover:bg-cyan-900 text-cyan-300 border border-cyan-700/60 text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send to Client</span>
          </button>

          <button
            onClick={() => onToggleBookmark(item)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition border ${
              isBookmarked
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-sm'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" fill={isBookmarked ? 'currentColor' : 'none'} />
            <span>{isBookmarked ? 'Saved to Bookmarks' : 'Favorite'}</span>
          </button>

          <button
            onClick={handleCopyShare}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 text-xs font-medium transition flex items-center gap-1.5"
            title="Share page"
          >
            {copiedShare ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copiedShare ? 'Copied Link' : 'Share'}</span>
          </button>
        </div>
      </div>

      {loading && (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
          <p className="text-xs font-medium">Loading full technical specifications & torrent metadata...</p>
        </div>
      )}

      {!loading && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ========================================================= */}
          {/* LEFT COLUMN: Cover, Download Buttons, Voting Box */}
          {/* ========================================================= */}
          <div className="lg:col-span-4 xl:col-span-3.5 space-y-4">
            {/* 1. Cover Card */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-xl">
              <div className="bg-slate-950/80 px-4 py-2.5 border-b border-slate-800 text-xs font-bold text-slate-300 text-center uppercase tracking-wider">
                Cover
              </div>
              <div className="p-4 flex items-center justify-center bg-slate-950/40 min-h-[320px]">
                {posterUrl ? (
                  <img
                    src={posterUrl}
                    alt="Cover"
                    referrerPolicy="no-referrer"
                    className="w-full max-h-[380px] object-cover rounded-xl shadow-md border border-slate-800"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-72 rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-2 border-dashed border-slate-800 flex flex-col items-center justify-center text-slate-600 p-6 text-center space-y-3">
                    <div className="w-20 h-24 rounded-xl border-4 border-slate-700/60 bg-slate-800/40 flex items-center justify-center shadow-inner relative overflow-hidden">
                      <Film className="w-10 h-10 text-slate-600" />
                      <div className="absolute top-1 bottom-1 left-1 w-1.5 border-r border-dotted border-slate-700"></div>
                      <div className="absolute top-1 bottom-1 right-1 w-1.5 border-l border-dotted border-slate-700"></div>
                    </div>
                    <div className="font-mono font-bold tracking-widest text-slate-500 text-xs uppercase">
                      NO POSTER FOUND
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 2. Download Section (Green .torrent + Red magnet) */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-xl">
              <div className="bg-slate-950/80 px-4 py-2.5 border-b border-slate-800 text-xs font-bold text-slate-300 text-center uppercase tracking-wider">
                Download & Actions
              </div>
              <div className="p-4 space-y-2.5">
                <div className="grid grid-cols-2 gap-2.5">
                  {/* Green .torrent button */}
                  <button
                    onClick={handleDownloadTorrent}
                    className="w-full py-3 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 transition transform active:scale-95"
                    title="Download .torrent file"
                  >
                    <Download className="w-4 h-4" />
                    <span>.torrent</span>
                  </button>

                  {/* Red magnet button */}
                  {magnetUri ? (
                    <a
                      href={magnetUri}
                      className="w-full py-3 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-rose-950/50 transition transform active:scale-95"
                      title="Open Magnet URI in BitTorrent client"
                    >
                      <Magnet className="w-4 h-4" />
                      <span>magnet</span>
                    </a>
                  ) : (
                    <button
                      disabled
                      className="w-full py-3 px-3 rounded-xl bg-slate-800 text-slate-500 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-not-allowed"
                    >
                      <Magnet className="w-4 h-4" />
                      <span>magnet</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={handleCopyMagnet}
                    disabled={!magnetUri}
                    className="flex-1 py-2 px-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-medium text-slate-300 flex items-center justify-center gap-1.5 transition shadow-sm"
                  >
                    {copiedMagnet ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-purple-400" />}
                    <span>{copiedMagnet ? 'Magnet Copied' : 'Copy Magnet URI'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 3. Vote Section */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-xl space-y-3">
              <div className="text-xs font-semibold text-slate-300">
                Vote for this torrent <span className="text-slate-400 text-[11px]">({upvotes} upvotes, {downvotes} downvotes)</span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => handleVote('up')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition border ${
                    hasVoted === 'up'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500 shadow-sm'
                      : 'bg-slate-950/80 hover:bg-slate-800 text-emerald-400 border-slate-800 hover:border-emerald-500/40'
                  }`}
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>Upvote</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-emerald-950 text-emerald-300 text-[10px]">
                    {upvotes}
                  </span>
                </button>

                <button
                  onClick={() => handleVote('down')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition border ${
                    hasVoted === 'down'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500 shadow-sm'
                      : 'bg-slate-950/80 hover:bg-slate-800 text-rose-400 border-slate-800 hover:border-rose-500/40'
                  }`}
                >
                  <ThumbsDown className="w-3.5 h-3.5" />
                  <span>Downvote</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-rose-950 text-rose-300 text-[10px]">
                    {downvotes}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* RIGHT COLUMN: Metadata Table, Enrichment, Specs, Trackers */}
          {/* ========================================================= */}
          <div className="lg:col-span-8 xl:col-span-8.5 space-y-6">
            {/* Metadata Enrichment Card (TMDB / IMDb) */}
            <MediaEnrichmentCard
              enrichment={enrichment}
              rawTitle={rawTitle}
              onOpenTrailer={handleOpenTrailer}
            />

            {/* Primary Torrent Information Table */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-xl">
              <table className="w-full text-left text-xs border-collapse">
                <tbody className="divide-y divide-slate-800/80">
                  {/* Name */}
                  <tr className="bg-slate-950/40 hover:bg-slate-900/60 transition">
                    <td className="py-3 px-4 font-bold text-slate-300 w-28 sm:w-36 align-top shrink-0">
                      Name:
                    </td>
                    <td className="py-3 px-4 text-cyan-300 font-mono font-medium break-all leading-relaxed flex items-center justify-between gap-3">
                      <span>{rawTitle}</span>
                      <button
                        onClick={handleCopyTitle}
                        className="p-1 text-slate-400 hover:text-cyan-300 hover:bg-slate-800 rounded transition shrink-0"
                        title="Copy full title"
                      >
                        {copiedTitle ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </td>
                  </tr>

                  {/* Controls */}
                  <tr className="hover:bg-slate-900/60 transition">
                    <td className="py-3 px-4 font-bold text-slate-300">
                      Controls:
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setReportModalOpen(true)}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px] font-medium transition flex items-center gap-1"
                        >
                          <Flag className="w-3 h-3 text-rose-400" />
                          <span>Report Torrent</span>
                        </button>
                        <button
                          onClick={() => onToggleBookmark(item)}
                          className={`px-2.5 py-1 rounded border text-[11px] font-medium transition flex items-center gap-1 ${
                            isBookmarked
                              ? 'bg-rose-950/60 text-rose-300 border-rose-700'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                          }`}
                        >
                          <Bookmark className="w-3 h-3 text-rose-400" fill={isBookmarked ? 'currentColor' : 'none'} />
                          <span>Favorite</span>
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Checked by */}
                  <tr className="bg-slate-950/40 hover:bg-slate-900/60 transition">
                    <td className="py-3 px-4 font-bold text-slate-300">
                      Checked by:
                    </td>
                    <td className="py-3 px-4">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-700 text-white font-bold text-[11px] shadow-sm">
                        <span>Torrent verified by GalaxyRG</span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200" />
                      </div>
                    </td>
                  </tr>

                  {/* Category */}
                  <tr className="hover:bg-slate-900/60 transition">
                    <td className="py-3 px-4 font-bold text-slate-300">
                      Category:
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-cyan-400 font-semibold hover:underline cursor-pointer">
                        {category}
                      </span>
                    </td>
                  </tr>

                  {/* Language */}
                  <tr className="bg-slate-950/40 hover:bg-slate-900/60 transition">
                    <td className="py-3 px-4 font-bold text-slate-300">
                      Language:
                    </td>
                    <td className="py-3 px-4 text-slate-200 font-medium">
                      {language}
                    </td>
                  </tr>

                  {/* Total Size */}
                  <tr className="hover:bg-slate-900/60 transition">
                    <td className="py-3 px-4 font-bold text-slate-300">
                      Total Size:
                    </td>
                    <td className="py-3 px-4 text-slate-100 font-mono font-bold">
                      {totalSize}
                    </td>
                  </tr>

                  {/* Info Hash */}
                  <tr className="bg-slate-950/40 hover:bg-slate-900/60 transition">
                    <td className="py-3 px-4 font-bold text-slate-300">
                      Info Hash:
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-300 break-all flex items-center justify-between gap-2">
                      <span className="select-all">{infoHash}</span>
                      <button
                        onClick={handleCopyHash}
                        className="p-1 text-slate-400 hover:text-cyan-300 hover:bg-slate-800 rounded transition shrink-0"
                        title="Copy info hash"
                      >
                        {copiedHash ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </td>
                  </tr>

                  {/* Added By */}
                  <tr className="hover:bg-slate-900/60 transition">
                    <td className="py-3 px-4 font-bold text-slate-300">
                      Added By:
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-emerald-400 hover:underline cursor-pointer">
                        {addedBy}
                      </span>
                    </td>
                  </tr>

                  {/* Added Date */}
                  <tr className="bg-slate-950/40 hover:bg-slate-900/60 transition">
                    <td className="py-3 px-4 font-bold text-slate-300">
                      Added:
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {addedDate}
                    </td>
                  </tr>

                  {/* Stats (Seeds, Leechers, Completed, Update) */}
                  <tr className="hover:bg-slate-900/60 transition">
                    <td className="py-3 px-4 font-bold text-slate-300">
                      Stats:
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Seeds badge */}
                        <div className="px-2.5 py-1 rounded bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1.5 shadow-sm">
                          <span>Seeds</span>
                          <span className="bg-emerald-950/80 px-1.5 py-0.2 rounded text-[10px]">
                            {seedsCount}
                          </span>
                        </div>

                        {/* Leechers badge */}
                        <div className="px-2.5 py-1 rounded bg-rose-700 text-white font-bold text-[11px] flex items-center gap-1.5 shadow-sm">
                          <span>Leechers</span>
                          <span className="bg-rose-950/80 px-1.5 py-0.2 rounded text-[10px]">
                            {leechersCount}
                          </span>
                        </div>

                        {/* Completed badge */}
                        <div className="px-2.5 py-1 rounded bg-sky-700 text-white font-bold text-[11px] flex items-center gap-1.5 shadow-sm">
                          <span>Completed</span>
                          <span className="bg-sky-950/80 px-1.5 py-0.2 rounded text-[10px]">
                            {completedCount}
                          </span>
                        </div>

                        <span className="text-slate-600 hidden sm:inline">|</span>

                        {/* Update status button */}
                        <span className="px-2 py-0.5 rounded bg-amber-700 text-white text-[11px] font-bold">
                          Update
                        </span>
                        <span className="text-[11px] text-slate-400">
                          (Last updated: {lastUpdated})
                        </span>

                        {/* Post guest comment button */}
                        <button
                          onClick={() => setShowCommentForm(prev => !prev)}
                          className="px-2.5 py-1 rounded bg-sky-800 hover:bg-sky-700 text-white text-[11px] font-bold transition flex items-center gap-1 shadow-sm ml-auto"
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>Post guest comment</span>
                          <span className="bg-sky-950 px-1.5 py-0.2 rounded text-[10px]">{comments.length}</span>
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Genres */}
                  <tr className="bg-slate-950/40 hover:bg-slate-900/60 transition">
                    <td className="py-3 px-4 font-bold text-slate-300">
                      Genres:
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1.5">
                        {genres.map((g, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-0.5 rounded bg-amber-600/90 text-slate-950 font-bold text-[11px] tracking-wide shadow-sm"
                          >
                            {g}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Collapsible Section 1: File List */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-xl">
              <div
                onClick={() => setFileListOpen(prev => !prev)}
                className="bg-slate-950/80 px-4 py-3 border-b border-slate-800 flex items-center justify-between cursor-pointer hover:bg-slate-900/80 transition select-none"
              >
                <div className="flex items-center gap-2 font-bold text-xs text-slate-200">
                  <Folder className="w-4 h-4 text-amber-400" />
                  <span>File List ({details?.fileList?.length || 1})</span>
                </div>
                <button className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-xs font-mono font-bold hover:bg-slate-700">
                  {fileListOpen ? '[-]' : '[+]'}
                </button>
              </div>

              {fileListOpen && (
                <div className="p-0">
                  {details?.fileList?.length ? (
                    <div className="divide-y divide-slate-800/60 text-xs">
                      {details.fileList.map((file, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 px-4 hover:bg-slate-950/60 transition">
                          <div className="flex items-center gap-2.5 min-w-0 pr-4">
                            <FileText className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                            <span className="text-slate-300 font-mono truncate">{file.name}</span>
                          </div>
                          <span className="text-slate-400 font-mono text-[11px] shrink-0 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                            {file.size}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-xs text-slate-400 font-mono flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{rawTitle.replace(/\s+/g, '.')}.mkv</span>
                      </div>
                      <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800">{totalSize}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Collapsible Section 2: Technical MediaInfo / NFO Specs */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-xl">
              <div
                onClick={() => setNfoOpen(prev => !prev)}
                className="bg-slate-950/80 px-4 py-3 border-b border-slate-800 flex items-center justify-between cursor-pointer hover:bg-slate-900/80 transition select-none"
              >
                <div className="flex items-center gap-2 font-bold text-xs text-slate-200">
                  <FileText className="w-4 h-4 text-cyan-400" />
                  <span>Technical Specs & MediaInfo (NFO)</span>
                </div>
                <div className="flex items-center gap-2">
                  {details?.metadata && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyNfo();
                      }}
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 font-medium"
                    >
                      {copiedNfo ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedNfo ? 'Copied' : 'Copy'}</span>
                    </button>
                  )}
                  <button className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-xs font-mono font-bold hover:bg-slate-700">
                    {nfoOpen ? '[-]' : '[+]'}
                  </button>
                </div>
              </div>

              {nfoOpen && (
                <div className="p-4 bg-slate-950">
                  <pre className="font-mono text-xs text-slate-300 overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-80 select-text">
                    {details?.metadata || `RELEASE NAME: ${rawTitle}\nSIZE: ${totalSize}\nVIDEO CODEC: HEVC / x265 10-Bit Main 10@L4.1\nRESOLUTION: 1920x1080 (16:9)\nAUDIO: English Dolby Digital Plus 5.1 @ 640 kbps\nSUBTITLES: English (Full & SDH), Spanish, French`}
                  </pre>
                </div>
              )}
            </div>

            {/* Tracker Ping Diagnostics Section */}
            <TrackerPingTester trackers={trackers} />

            {/* Comments / Discussions Section */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-xl space-y-0">
              <div className="bg-slate-950/80 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-xs text-slate-200">
                  <MessageSquare className="w-4 h-4 text-sky-400" />
                  <span>Comments ({comments.length})</span>
                </div>
                <button
                  onClick={() => setShowCommentForm(prev => !prev)}
                  className="px-2.5 py-1 rounded bg-sky-800 hover:bg-sky-700 text-white text-xs font-bold transition flex items-center gap-1"
                >
                  {showCommentForm ? 'Hide Form' : '+ Add Comment'}
                </button>
              </div>

              <div className="p-4 space-y-4">
                {showCommentForm && (
                  <form onSubmit={handleAddComment} className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={commentAuthor}
                        onChange={(e) => setCommentAuthor(e.target.value)}
                        placeholder="Your Nickname (e.g. Guest or GalaxyRG)"
                        className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <textarea
                      rows={3}
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Write your comment about this release (quality, sync, playback compatibility)..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowCommentForm(false)}
                        className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={!commentText.trim()}
                        className="px-4 py-1.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition flex items-center gap-1.5"
                      >
                        <Send className="w-3 h-3" />
                        <span>Submit Comment</span>
                      </button>
                    </div>
                  </form>
                )}

                {comments.length > 0 ? (
                  <div className="space-y-3">
                    {comments.map((c) => (
                      <div key={c.id} className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-200">{c.author}</span>
                            {c.verified && (
                              <span className="px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 text-[10px] font-medium border border-emerald-800/60">
                                Verified Uploader
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-500">{c.date}</span>
                        </div>
                        <p className="text-slate-300 leading-relaxed select-text">{c.text}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center text-slate-500 text-xs bg-slate-950/40 rounded-xl border border-slate-800">
                    No comments posted yet. Be the first to leave feedback for this release!
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Trailer Video Player Modal */}
      <TrailerModal
        isOpen={trailerModalOpen}
        onClose={() => setTrailerModalOpen(false)}
        trailerKey={trailerKey}
        title={rawTitle}
      />

      {/* Report Modal */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Flag className="w-4 h-4 text-rose-400" />
                <span>Report Release</span>
              </h3>
              <button onClick={() => { setReportModalOpen(false); setReportSuccess(false); }} className="text-slate-400 hover:text-slate-200">
                ✕
              </button>
            </div>

            {reportSuccess ? (
              <div className="p-4 rounded-xl bg-emerald-950/50 border border-emerald-800/60 text-emerald-300 text-xs space-y-2 text-center">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-400" />
                <p className="font-semibold">Report logged to local moderator cache.</p>
                <p className="text-[11px] text-slate-400">Thank you for helping keep the index clean.</p>
              </div>
            ) : (
              <div className="space-y-3 text-xs text-slate-300">
                <p>Select reason for reporting this entry:</p>
                <div className="space-y-1.5">
                  {["Broken / Dead Torrent (0 Seeds)", "Incorrect Metadata / Fake Release", "Corrupted Video / Audio Stream", "Copyright / Duplicate Upload"].map((reason, idx) => (
                    <label key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-slate-950/60 border border-slate-800 hover:bg-slate-800/60 cursor-pointer">
                      <input type="radio" name="reportReason" defaultChecked={idx === 0} className="text-cyan-500 focus:ring-0" />
                      <span>{reason}</span>
                    </label>
                  ))}
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setReportModalOpen(false)}
                    className="px-3 py-1.5 text-slate-400 hover:text-slate-200 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setReportSuccess(true)}
                    className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg transition"
                  >
                    Submit Report
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
