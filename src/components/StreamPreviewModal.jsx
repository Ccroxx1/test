import React, { useState } from 'react';
import { Play, Film, Volume2, X, AlertCircle, Info, Sparkles } from 'lucide-react';

export default function StreamPreviewModal({ isOpen, onClose, item }) {
  const [selectedFile, setSelectedFile] = useState(0);

  if (!isOpen || !item) return null;

  const files = [
    { name: `${item.title.replace(/\s+/g, '.')}.mkv`, size: item.size || '1.6 GB', type: 'Main Video' },
    { name: 'Sample.mkv', size: '48.2 MB', type: 'Preview Sample' },
    { name: 'Subs.English.srt', size: '124 KB', type: 'Subtitles' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-colors duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-500/10 border border-purple-300 dark:border-purple-500/30 text-purple-600 dark:text-purple-400">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base line-clamp-1">
                In-Browser Stream & Sample Player
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                P2P Media Preview Engine (WebTorrent / HTML5 Canvas Streamer)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Player Box */}
        <div className="relative aspect-video bg-black flex flex-col items-center justify-center overflow-hidden border-b border-slate-800">
          {/* Simulated HTML5 Video Stream or Sample playback */}
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-t from-slate-950 via-slate-900 to-black relative">
            {item.image && (
              <img
                src={item.image}
                alt=""
                className="absolute inset-0 w-full h-full object-cover opacity-20 filter blur-sm"
              />
            )}

            <div className="relative z-10 flex flex-col items-center max-w-md">
              <div className="w-16 h-16 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 flex items-center justify-center shadow-lg shadow-cyan-500/20 mb-3 animate-pulse">
                <Play className="w-7 h-7 ml-1 fill-cyan-300" />
              </div>
              <h4 className="font-bold text-slate-100 text-sm line-clamp-1 mb-1">{item.title}</h4>
              <p className="text-xs text-slate-400 mb-4 font-mono">
                Streaming: {files[selectedFile]?.name} ({files[selectedFile]?.size})
              </p>

              <div className="w-full bg-slate-800/80 rounded-full h-1.5 mb-2 overflow-hidden border border-slate-700/50">
                <div className="bg-gradient-to-r from-cyan-500 to-purple-500 h-full w-2/3 rounded-full animate-pulse" />
              </div>
              <div className="flex items-center justify-between w-full text-[10px] font-mono text-slate-400">
                <span>00:14:22</span>
                <span className="text-emerald-400">Buffering from 28 high-speed WebTorrent peers</span>
                <span>01:58:30</span>
              </div>
            </div>
          </div>
        </div>

        {/* File & Quality Selector */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950/40 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
            <span>Select Stream File:</span>
            <span className="text-[11px] text-purple-600 dark:text-purple-400 font-mono">Direct Seekable Bitstream</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {files.map((f, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedFile(idx)}
                className={`p-2.5 rounded-xl border text-left text-xs transition flex flex-col gap-1 ${
                  selectedFile === idx
                    ? 'bg-purple-100 dark:bg-purple-950/40 border-purple-400 dark:border-purple-500/60 text-purple-900 dark:text-purple-200'
                    : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="font-semibold truncate">{f.name}</div>
                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span>{f.type}</span>
                  <span className="font-mono">{f.size}</span>
                </div>
              </button>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
              <span>Direct playback works seamlessly with compatible WebTorrent peers and `.mp4` / `.webm` containers.</span>
            </div>
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
