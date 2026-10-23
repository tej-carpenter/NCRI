import React, { useState, useEffect } from 'react';
import { Database, RefreshCw, Server, ExternalLink, CheckCircle2, Trash2 } from 'lucide-react';
import { DataSource } from '../types';
import { NCRIRepository } from '../services/repository';
import { NativeService } from '../services/native';

interface MobileSourcesProps {
  onRefreshAll: () => void;
}

export const MobileSources: React.FC<MobileSourcesProps> = ({ onRefreshAll }) => {
  const [sources, setSources] = useState<DataSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncingSlug, setSyncingSlug] = useState<string | null>(null);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  // Settings
  const [backendUrl, setBackendUrl] = useState(NCRIRepository.getBackendUrl());
  const [savedUrlSuccess, setSavedUrlSuccess] = useState(false);

  const loadSources = async () => {
    setLoading(true);
    try {
      const res = await NCRIRepository.getSources();
      setSources(res.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSources();
  }, []);

  const handleSyncSource = async (slug: string) => {
    NativeService.hapticFeedback();
    setSyncingSlug(slug);
    setSyncMessage(null);
    try {
      const res = await NCRIRepository.triggerSourceSync(slug, 100);
      setSyncMessage(`${slug}: ${res.message || 'Sync completed'}`);
      NativeService.hapticSuccess();
      await loadSources();
      onRefreshAll();
    } catch (err: any) {
      setSyncMessage(`Sync failed: ${err.message}`);
    } finally {
      setSyncingSlug(null);
    }
  };

  const handleSaveBackendUrl = async () => {
    NativeService.hapticFeedback();
    await NCRIRepository.setBackendUrl(backendUrl);
    setSavedUrlSuccess(true);
    setTimeout(() => setSavedUrlSuccess(false), 3000);
    onRefreshAll();
    loadSources();
  };

  const handleClearCache = async () => {
    NativeService.hapticFeedback();
    localStorage.clear();
    alert('Local offline cache cleared.');
    onRefreshAll();
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Sync Status Toast */}
      {syncMessage && (
        <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 p-3 rounded-2xl flex items-center justify-between text-xs text-blue-700 dark:text-blue-300">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
            <span>{syncMessage}</span>
          </div>
          <button onClick={() => setSyncMessage(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* Verified Threat Intelligence Feeds matching Web Platform */}
      <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-[#131826] p-4 shadow-xs space-y-3 transition-colors duration-200">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-2">
            <Database className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
              Authenticated Ingestion Feeds
            </h3>
          </div>
          <button
            onClick={loadSources}
            className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="py-8 text-center text-xs text-slate-400">Loading feed registry...</div>
        ) : sources.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-500">No active sources found.</div>
        ) : (
          <div className="space-y-2.5">
            {sources.map((src) => (
              <div
                key={src.id}
                className="bg-slate-50 dark:bg-[#0b0f19] p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div className="pr-2">
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1">{src.name}</h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                      {src.description}
                    </p>
                  </div>
                  <button
                    onClick={() => handleSyncSource(src.slug)}
                    disabled={syncingSlug === src.slug}
                    className="px-3 py-1 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-[11px] flex items-center space-x-1 shrink-0 active:scale-95 transition disabled:opacity-50 shadow-xs"
                  >
                    <RefreshCw className={`w-3 h-3 ${syncingSlug === src.slug ? 'animate-spin' : ''}`} />
                    <span>Sync</span>
                  </button>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-800/80 font-mono">
                  <span>Type: {src.source_type}</span>
                  <span>Ingested: {src.incident_count} records</span>
                  <span>Freq: {src.update_frequency || 'Continuous'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Backend API Configuration */}
      <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-[#131826] p-4 shadow-xs space-y-3 transition-colors duration-200">
        <div className="flex items-center space-x-2">
          <Server className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
            Backend Connection
          </h3>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-500 uppercase block">API Server Endpoint</label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={backendUrl}
              onChange={(e) => setBackendUrl(e.target.value)}
              placeholder="https://ncri.onrender.com"
              className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={handleSaveBackendUrl}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold active:scale-95 transition shadow-xs"
            >
              Save
            </button>
          </div>
          {savedUrlSuccess && (
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">✓ API base URL updated & verified!</p>
          )}
        </div>

        <div className="pt-2 flex items-center space-x-3 text-xs">
          <a
            href="https://ncri.onrender.com/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1"
          >
            <span>FastAPI Swagger Docs</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <a
            href="https://ncri.onrender.com/api/health"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1"
          >
            <span>Health Status</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <div className="pt-2">
          <button
            onClick={handleClearCache}
            className="w-full py-2 rounded-xl border border-slate-300 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-xs text-rose-600 dark:text-rose-400 font-semibold flex items-center justify-center space-x-1.5 active:scale-95 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Offline Cache</span>
          </button>
        </div>
      </div>
    </div>
  );
};
