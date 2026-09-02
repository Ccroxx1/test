import React, { useState } from 'react';
import { Rss, Copy, Check, ExternalLink, Download, Radio, Filter, Sparkles, X } from 'lucide-react';

export default function RssModal({ isOpen, onClose }) {
  const [selectedCat, setSelectedCat] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const rssParams = new URLSearchParams();
  if (selectedCat) rssParams.set('category', selectedCat);
  if (searchQuery.trim()) rssParams.set('q', searchQuery.trim());

  const rssUrl = `${window.location.origin}/api/rss${rssParams.toString() ? '?' + rssParams.toString() : ''}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(rssUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-colors duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-500/30 text-amber-600 dark:text-amber-400">
              <Rss className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
                Custom RSS Feed Generator
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Plug automated release feeds into Sonarr, Radarr, or qBittorrent
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

        {/* Configuration Controls */}
        <div className="p-5 space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1.5">Filter by Category:</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: '', label: 'All Releases' },
                { id: 'Movies', label: 'Movies' },
                { id: 'TV Episodes', label: 'TV Episodes' },
                { id: 'TV Packs', label: 'TV Packs' },
                { id: 'CAMs', label: 'CAMs' },
                { id: 'Split Scenes', label: 'Split Scenes' }
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCat(cat.id)}
                  className={`px-3 py-2 rounded-xl border text-center transition font-medium ${
                    selectedCat === cat.id
                      ? 'bg-amber-100 dark:bg-amber-500/20 border-amber-400 dark:border-amber-500/50 text-amber-800 dark:text-amber-300 font-bold'
                      : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1.5">Optional Keyword Filter:</label>
            <input
              type="text"
              placeholder="e.g. 2160p, 1080p, x265, GalaxyRG, Dune..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
            />
          </div>

          {/* Generated RSS URL */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-400 font-medium">Your Auto-Updating RSS URL:</span>
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-mono">Standard RSS 2.0 + Enclosure</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={rssUrl}
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/60 text-slate-800 dark:text-slate-300 font-mono text-xs select-all focus:outline-none"
              />
              <button
                onClick={handleCopy}
                className={`px-3 py-2 rounded-lg font-bold flex items-center gap-1.5 transition ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                }`}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Guide for Sonarr & Radarr */}
          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 text-slate-700 dark:text-slate-300 space-y-1.5">
            <h4 className="font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Quick Integration Guide:
            </h4>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              In <strong>Sonarr / Radarr</strong>, go to <code>Settings &rarr; Indexers &rarr; Add &rarr; Custom Torznab / RSS Feed</code>, paste this URL, and set the minimum sync interval to 15 minutes.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex items-center justify-end gap-2">
          <a
            href={rssUrl}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Open Raw XML
          </a>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
