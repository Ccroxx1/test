import React, { useState, useEffect } from 'react';
import { Send, Server, Check, AlertCircle, RefreshCw, Lock, Globe, HardDrive, X } from 'lucide-react';

export default function ClientDispatchModal({ isOpen, onClose, item }) {
  const [clientType, setClientType] = useState(() => {
    return localStorage.getItem('atlas_client_type') || 'qBittorrent';
  });
  const [host, setHost] = useState(() => {
    return localStorage.getItem('atlas_client_host') || 'http://localhost:8080';
  });
  const [username, setUsername] = useState(() => {
    return localStorage.getItem('atlas_client_user') || 'admin';
  });
  const [password, setPassword] = useState(() => {
    return localStorage.getItem('atlas_client_pass') || '';
  });
  const [saveSettings, setSaveSettings] = useState(true);

  const [status, setStatus] = useState('idle'); // idle | sending | success | error
  const [statusMsg, setStatusMsg] = useState('');

  if (!isOpen || !item) return null;

  const handleDispatch = async (e) => {
    e.preventDefault();
    setStatus('sending');
    setStatusMsg('');

    if (saveSettings) {
      localStorage.setItem('atlas_client_type', clientType);
      localStorage.setItem('atlas_client_host', host);
      localStorage.setItem('atlas_client_user', username);
      localStorage.setItem('atlas_client_pass', password);
    }

    try {
      const res = await fetch('/api/client-dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientType,
          host,
          username,
          password,
          magnet: item.magnet,
          torrentUrl: item.torrent || item.url,
          title: item.title
        })
      });

      const data = await res.json();
      if (data.success) {
        setStatus('success');
        setStatusMsg(data.message || 'Payload sent to remote torrent client WebUI.');
        setTimeout(() => {
          setStatus('idle');
          onClose();
        }, 2200);
      } else {
        setStatus('error');
        setStatusMsg(data.error || 'Failed to dispatch torrent to remote client.');
      }
    } catch (err) {
      setStatus('error');
      setStatusMsg(err.message || 'Network connection failed.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-colors duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-100 dark:bg-cyan-500/10 border border-cyan-300 dark:border-cyan-500/30 text-cyan-600 dark:text-cyan-400">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                Send to Seedbox / Client WebUI
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                qBittorrent, Transmission, or Deluge Web API
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

        {/* Form Body */}
        <form onSubmit={handleDispatch} className="p-5 space-y-4 text-xs">
          {/* Target Torrent Details Preview */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-100 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-400 border border-cyan-300 dark:border-cyan-800/40 shrink-0">
              <HardDrive className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-slate-900 dark:text-slate-200 truncate">{item.title}</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-3 mt-0.5 font-mono">
                <span>Size: {item.size || 'Unknown'}</span>
                <span>Seeds: <strong className="text-emerald-600 dark:text-emerald-400">{item.seeds || 0}</strong></span>
              </div>
            </div>
          </div>

          {/* Client Selection */}
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1.5">Torrent Client Engine:</label>
            <div className="grid grid-cols-3 gap-2">
              {['qBittorrent', 'Transmission', 'Deluge'].map(c => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setClientType(c)}
                  className={`px-3 py-2 rounded-xl border text-center transition font-semibold ${
                    clientType === c
                      ? 'bg-cyan-50 dark:bg-cyan-500/20 border-cyan-400 dark:border-cyan-500/50 text-cyan-700 dark:text-cyan-300'
                      : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* WebUI Host Address */}
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1.5 flex items-center justify-between">
              <span>WebUI Host / IP & Port:</span>
              <span className="text-[10px] text-slate-500">e.g. http://192.168.1.100:8080</span>
            </label>
            <div className="relative">
              <Globe className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                required
                value={host}
                onChange={(e) => setHost(e.target.value)}
                placeholder="http://localhost:8080 or seedbox.host.com"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 font-mono text-xs focus:outline-none focus:border-cyan-500/50"
              />
            </div>
          </div>

          {/* Credentials */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1.5">Username:</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 text-xs focus:outline-none focus:border-cyan-500/50"
              />
            </div>
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1.5">Password / Token:</label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 text-xs focus:outline-none focus:border-cyan-500/50"
                />
              </div>
            </div>
          </div>

          {/* Save toggle */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="save_client_prefs"
              checked={saveSettings}
              onChange={(e) => setSaveSettings(e.target.checked)}
              className="rounded bg-slate-100 dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-cyan-600 focus:ring-0 cursor-pointer"
            />
            <label htmlFor="save_client_prefs" className="text-slate-600 dark:text-slate-400 cursor-pointer text-xs">
              Remember client host & credentials securely in local storage
            </label>
          </div>

          {/* Status Message */}
          {status === 'success' && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 flex items-center gap-2 font-medium">
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{statusMsg}</span>
            </div>
          )}

          {status === 'error' && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800/60 text-rose-800 dark:text-rose-300 flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
              <span>{statusMsg}</span>
            </div>
          )}

          {/* Submit Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={status === 'sending'}
              className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-cyan-600/20 disabled:opacity-50"
            >
              {status === 'sending' ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Send to {clientType}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
