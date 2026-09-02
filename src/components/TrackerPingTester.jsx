import React, { useState } from 'react';
import { Radio, Activity, RefreshCw, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';

export default function TrackerPingTester({ trackers = [] }) {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState(null);

  const handleTestPing = async () => {
    if (!trackers.length) return;
    setTesting(true);
    try {
      const res = await fetch('/api/ping-trackers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackers })
      });
      const data = await res.json();
      setResults(data.results || []);
    } catch (err) {
      console.error(err);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-xl">
      <div className="bg-slate-950/80 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-xs text-slate-200">
          <Radio className="w-4 h-4 text-purple-400" />
          <span>Announce Tracker Diagnostics ({trackers.length})</span>
        </div>
        <button
          onClick={handleTestPing}
          disabled={testing || !trackers.length}
          className="px-2.5 py-1 rounded bg-purple-900/60 hover:bg-purple-800 text-purple-200 border border-purple-700/60 text-xs font-bold transition flex items-center gap-1 shadow-sm disabled:opacity-50"
        >
          <Zap className={`w-3.5 h-3.5 ${testing ? 'animate-spin text-amber-400' : ''}`} />
          <span>{testing ? 'Testing Pings...' : 'Ping All Trackers'}</span>
        </button>
      </div>

      <div className="p-4 space-y-2 max-h-56 overflow-y-auto">
        {results ? (
          <div className="space-y-2">
            {results.map((r, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2 min-w-0 pr-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="font-mono text-slate-300 truncate">{r.tracker}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0 font-mono text-[11px]">
                  <span className="text-emerald-400 font-bold">{r.peersFound} peers</span>
                  <span className="text-slate-400">{r.latencyMs}ms</span>
                  <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 text-[10px]">{r.protocol}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="font-mono text-[11px] text-slate-400 space-y-1.5">
            {trackers.map((tr, idx) => (
              <div key={idx} className="flex items-center justify-between py-1 border-b border-slate-800/40">
                <span className="truncate pr-2 text-slate-300">{tr}</span>
                <span className="px-1.5 py-0.2 rounded bg-slate-800 text-[10px] text-slate-400 shrink-0">standby</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
