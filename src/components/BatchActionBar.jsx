import React, { useState } from 'react';
import { Copy, Check, Archive, Download, Trash2, HardDrive, CheckSquare, Square, Magnet } from 'lucide-react';
import JSZip from 'jszip';

export default function BatchActionBar({
  selectedItems = [],
  onClearSelection,
  onOpenDetails
}) {
  const [copiedAll, setCopiedAll] = useState(false);
  const [downloadingZip, setDownloadingZip] = useState(false);

  if (!selectedItems || selectedItems.length === 0) return null;

  const handleCopyAllMagnets = () => {
    const magnets = selectedItems
      .map(item => item.magnet)
      .filter(Boolean)
      .join('\n\n');

    if (magnets) {
      navigator.clipboard.writeText(magnets);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2500);
    }
  };

  const handleExportTxt = () => {
    const content = selectedItems.map((item, idx) => {
      return `[#${idx + 1}] ${item.title}\nSize: ${item.size || 'N/A'} | Category: ${item.category || 'N/A'}\nMagnet: ${item.magnet || 'N/A'}\nTorrent: ${item.torrent || item.url || 'N/A'}\n----------------------------------------\n`;
    }).join('\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MiTorrents_Batch_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadAllZip = async () => {
    setDownloadingZip(true);
    try {
      const zip = new JSZip();
      
      // Add individual torrent / magnet pointer files
      selectedItems.forEach((item, index) => {
        const safeName = (item.title || `torrent_${index + 1}`).replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 70);
        if (item.magnet) {
          zip.file(`${safeName}.magnet`, item.magnet);
        }
      });

      // Add summary list
      const summary = selectedItems.map((it, i) => `${i + 1}. ${it.title} (${it.size || ''})\n   ${it.magnet || it.torrent || ''}`).join('\n\n');
      zip.file("README_BATCH_EXPORT.txt", summary);

      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `MiTorrents_Batch_${selectedItems.length}_Items.zip`;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to generate zip:", err);
    } finally {
      setDownloadingZip(false);
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-2xl bg-white/95 dark:bg-slate-900/95 border border-cyan-500/50 rounded-2xl p-3 sm:p-4 shadow-2xl shadow-cyan-950/40 backdrop-blur-md transition-colors duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Selection Count Badge */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-cyan-500 text-slate-950 flex items-center justify-center font-bold text-xs shadow-md">
            {selectedItems.length}
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <span>{selectedItems.length} {selectedItems.length === 1 ? 'Release' : 'Releases'} Selected</span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              Perform batch operations across chosen media items
            </div>
          </div>
        </div>

        {/* Batch Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Copy All Magnets */}
          <button
            onClick={handleCopyAllMagnets}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm ${
              copiedAll
                ? 'bg-emerald-600 text-white'
                : 'bg-cyan-50 dark:bg-slate-800 hover:bg-cyan-100 dark:hover:bg-slate-700 text-cyan-800 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-500/30'
            }`}
          >
            {copiedAll ? <Check className="w-3.5 h-3.5" /> : <Magnet className="w-3.5 h-3.5" />}
            <span>{copiedAll ? 'Copied All!' : 'Copy Magnets'}</span>
          </button>

          {/* Export TXT */}
          <button
            onClick={handleExportTxt}
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export .txt</span>
          </button>

          {/* Download All (ZIP) */}
          <button
            onClick={handleDownloadAllZip}
            disabled={downloadingZip}
            className="px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-md disabled:opacity-50"
          >
            <Archive className="w-3.5 h-3.5" />
            <span>{downloadingZip ? 'Packaging...' : 'Download ZIP'}</span>
          </button>

          {/* Deselect All */}
          <button
            onClick={onClearSelection}
            className="p-1.5 rounded-xl hover:bg-rose-100 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition"
            title="Clear Selection"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
