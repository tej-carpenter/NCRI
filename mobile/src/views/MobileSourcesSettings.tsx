import React, { useState, useEffect } from 'react';
import {
  Database,
  RefreshCw,
  Server,
  Smartphone,
  Wifi,
  Trash2,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Cpu,
  Battery,
  ShieldCheck,
} from 'lucide-react';
import { DataSource } from '../types';
import { NCRIRepository } from '../services/repository';
import { NativeService } from '../services/native';

interface MobileSourcesSettingsProps {
  onRefreshAll: () => void;
}

export const MobileSourcesSettings: React.FC<MobileSourcesSettingsProps> = ({ onRefreshAll }) => {
  const [sources, setSources] = useState<DataSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncingSlug, setSyncingSlug] = useState<string | null>(null);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  // Settings
  const [backendUrl, setBackendUrl] = useState(NCRIRepository.getBackendUrl());
  const [savedUrlSuccess, setSavedUrlSuccess] = useState(false);

  // Native Device Information
  const [deviceDetails, setDeviceDetails] = useState<{ info: any; battery: any }>({
    info: {},
    battery: {},
  });
  const [netStatus, setNetStatus] = useState<any>({ connected: true });

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
    NativeService.getDeviceInfo().then(setDeviceDetails);
    NativeService.getNetworkStatus().then(setNetStatus);
  }, []);

  const handleSyncSource = async (slug: string) => {
    NativeService.hapticFeedback();
    setSyncingSlug(slug);
    setSyncMessage(null);
    try {
      const res = await NCRIRepository.triggerSourceSync(slug, 100);
      setSyncMessage(`${slug}: ${res.message || res.status}`);
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
    alert('Local offline cache cleared successfully.');
    onRefreshAll();
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Sync Status Feedback Toast */}
      {syncMessage && (
        <div className="bg-blue-600/20 border border-blue-500/40 p-3 rounded-xl flex items-center justify-between text-xs text-blue-300">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
            <span>{syncMessage}</span>
          </div>
          <button onClick={() => setSyncMessage(null)} className="text-slate-400 hover:text-white text-xs">
            ✕
          </button>
        </div>
      )}

      {/* Verified Threat Data Sources */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Database className="w-4 h-4 text-blue-400" />
            <h2 className="text-sm font-bold text-white">Threat Intelligence Feeds</h2>
          </div>
          <button
            onClick={loadSources}
            className="text-xs text-blue-400 hover:text-blue-300"
          >
            Refresh List
          </button>
        </div>

        {loading ? (
          <div className="py-8 text-center text-xs text-slate-400">Loading feed sources...</div>
        ) : sources.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-500">No active sources configured.</div>
        ) : (
          <div className="space-y-2.5 pt-1">
            {sources.map((src) => (
              <div
                key={src.id}
                className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div className="pr-2">
                    <h3 className="font-bold text-xs text-white line-clamp-1">{src.name}</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">{src.description}</p>
                  </div>
                  <button
                    onClick={() => handleSyncSource(src.slug)}
                    disabled={syncingSlug === src.slug}
                    className="px-3 py-1.5 rounded-lg bg-blue-600/90 hover:bg-blue-500 text-white font-medium text-xs flex items-center space-x-1 shrink-0 active:scale-95 transition disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3 h-3 ${syncingSlug === src.slug ? 'animate-spin' : ''}`} />
                    <span>Sync</span>
                  </button>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800/60 font-mono">
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
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 shadow-sm space-y-3">
        <div className="flex items-center space-x-2">
          <Server className="w-4 h-4 text-indigo-400" />
          <h2 className="text-sm font-bold text-white">Backend Connection</h2>
        </div>

        <p className="text-xs text-slate-400">
          The hybrid application communicates with the live NCRI FastAPI REST server.
        </p>

        <div className="space-y-2">
          <label className="text-[11px] text-slate-400 font-medium block">API Server Base URL</label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={backendUrl}
              onChange={(e) => setBackendUrl(e.target.value)}
              placeholder="https://ncri.onrender.com"
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={handleSaveBackendUrl}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold active:scale-95 transition"
            >
              Save
            </button>
          </div>
          {savedUrlSuccess && (
            <p className="text-xs text-emerald-400 font-medium">✓ API URL saved & reloaded!</p>
          )}
        </div>

        <div className="pt-2 flex items-center space-x-3 text-xs">
          <a
            href="https://ncri.onrender.com/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline flex items-center space-x-1"
          >
            <span>FastAPI Swagger Docs</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <a
            href="https://ncri.onrender.com/api/health"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline flex items-center space-x-1"
          >
            <span>Health Endpoint</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Native Device & HMAD Runtime Metrics */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 shadow-sm space-y-3">
        <div className="flex items-center space-x-2">
          <Smartphone className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-bold text-white">Hybrid Runtime & Hardware Bridge</h2>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/70">
            <span className="text-[10px] text-slate-500 block">CONTAINER</span>
            <span className="font-semibold text-white">Capacitor v7 Hybrid</span>
          </div>

          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/70">
            <span className="text-[10px] text-slate-500 block">PLATFORM</span>
            <span className="font-semibold text-white capitalize">
              {deviceDetails.info?.platform || 'Android'} ({deviceDetails.info?.operatingSystem || 'Native OS'})
            </span>
          </div>

          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/70">
            <span className="text-[10px] text-slate-500 block">DEVICE MODEL</span>
            <span className="font-semibold text-white truncate block">
              {deviceDetails.info?.model || 'Mobile Device'}
            </span>
          </div>

          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/70">
            <span className="text-[10px] text-slate-500 block">NETWORK</span>
            <span className="font-semibold text-white flex items-center space-x-1">
              <span
                className={`w-2 h-2 rounded-full ${
                  netStatus.connected ? 'bg-emerald-500' : 'bg-rose-500'
                }`}
              />
              <span>{netStatus.connectionType || 'Connected'}</span>
            </span>
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={handleClearCache}
            className="w-full py-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs text-rose-400 font-medium flex items-center justify-center space-x-1.5 active:scale-95 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Local Storage & Offline Cache</span>
          </button>
        </div>
      </div>

      {/* Academic Project Credits */}
      <div className="text-center text-[11px] text-slate-500 space-y-1 pt-2">
        <p className="font-medium text-slate-400">
          National Cyber Crime Risk Index (NCRI)
        </p>
        <p>National Institute of Technology, Tiruchirappalli (NITT)</p>
        <p>Mobile Application Development • Hybrid HMAD Implementation</p>
      </div>
    </div>
  );
};
