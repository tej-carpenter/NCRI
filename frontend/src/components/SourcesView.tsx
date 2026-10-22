'use client';

import React, { useState, useEffect } from 'react';
import { fetchSources, triggerSourceSync, uploadDatasetFile, fetchSourceRuns } from '../lib/api';
import { DataSource, IngestionRun } from '../types';

export const SourcesView: React.FC = () => {
  const [sources, setSources] = useState<DataSource[]>([]);
  const [recentRuns, setRecentRuns] = useState<IngestionRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncingSlug, setSyncingSlug] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const loadData = React.useCallback(async () => {
    setLoading(true);
    try {
      const srcList = await fetchSources();
      setSources(srcList);

      const allRuns: IngestionRun[] = [];
      for (const s of srcList) {
        if (s.slug !== 'custom_upload') {
          try {
            const runs = await fetchSourceRuns(s.slug);
            allRuns.push(...runs);
          } catch {}
        }
      }
      allRuns.sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime());
      setRecentRuns(allRuns.slice(0, 10));
    } catch (e) {
      console.error('Failed to load sources:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSync = async (slug: string) => {
    setSyncingSlug(slug);
    try {
      await triggerSourceSync(slug);
      await loadData();
    } catch (e) {
      console.error(`Sync failed for ${slug}:`, e);
    } finally {
      setSyncingSlug(null);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploadStatus('Uploading and parsing dataset...');
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const res = await uploadDatasetFile(formData);
      setUploadStatus(`Success: ${res.message}`);
      setSelectedFile(null);
      await loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setUploadStatus(`Upload failed: ${msg}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header (Material Surface Card) */}
      <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-[#131826] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.2)]">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
          Data Provenance Registry & Automated Ingestion Pipeline
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Audit trails, repeatable ingestion adapters, deduplication counters, and ad-hoc CSV/JSON dataset ingestion.
        </p>
      </div>

      {/* Sources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sources.map((src) => (
          <div
            key={src.id}
            className="rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-[#131826] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.2)] flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{src.name}</h4>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">{src.slug}</span>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold border ${
                    src.last_sync_status === 'success'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/60'
                      : src.last_sync_status === 'running'
                      ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/60'
                      : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                  }`}
                >
                  {src.last_sync_status === 'success' ? 'Synchronized' : src.last_sync_status}
                </span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                {src.description}
              </p>

              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800 mb-4">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-semibold">Incidents / Records</span>
                  <span className="text-slate-900 dark:text-white font-mono font-bold text-sm">
                    {src.incident_count.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-semibold">Cadence</span>
                  <span className="text-slate-700 dark:text-slate-300 font-medium">{src.update_frequency || 'Manual'}</span>
                </div>
                <div className="col-span-2 pt-1 border-t border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 dark:text-slate-500 text-[10px] block">License / Provenance:</span>
                  <span className="text-slate-600 dark:text-slate-300 text-[11px] truncate block font-medium">{src.license || 'Open Access'}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Last Sync: {src.last_sync_at ? new Date(src.last_sync_at).toLocaleString() : 'Recent'}
              </span>

              {src.slug !== 'custom_upload' && (
                <button
                  onClick={() => handleSync(src.slug)}
                  disabled={syncingSlug === src.slug}
                  className="rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors disabled:opacity-50"
                >
                  {syncingSlug === src.slug ? 'Ingesting...' : 'Sync Adapter'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Dataset Upload Section */}
      <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-[#131826] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.2)]">
        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
          Upload Custom Institutional Incident Dataset (CSV / JSON)
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Directly import custom incident logs or newly released national security bulletins. Normalization and duplicate-detection pipeline runs automatically.
        </p>

        <form onSubmit={handleUploadSubmit} className="flex flex-col sm:flex-row items-center gap-3">
          <input
            type="file"
            accept=".csv,.json"
            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            className="w-full text-xs text-slate-500 dark:text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-slate-100 dark:file:bg-slate-800 file:text-slate-700 dark:file:text-slate-200 hover:file:bg-slate-200 dark:hover:file:bg-slate-700 cursor-pointer"
          />
          <button
            type="submit"
            disabled={!selectedFile}
            className="w-full sm:w-auto whitespace-nowrap rounded-full bg-blue-600 hover:bg-blue-700 px-5 py-2 text-xs font-semibold text-white transition-colors disabled:opacity-40 shadow-xs"
          >
            Import Dataset
          </button>
        </form>

        {uploadStatus && (
          <div className="mt-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 p-3 text-xs text-blue-700 dark:text-blue-300 font-medium">
            {uploadStatus}
          </div>
        )}
      </div>

      {/* Ingestion Runs Audit Trail Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-[#131826] shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.2)]">
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 flex items-center justify-between">
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Recent Ingestion Run Audit Logs
          </h4>
          <span className="text-xs text-slate-500 dark:text-slate-400">Execution Provenance</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3.5">Run ID</th>
                <th className="px-4 py-3.5">Source Name</th>
                <th className="px-4 py-3.5">Timestamp</th>
                <th className="px-4 py-3.5">Processed</th>
                <th className="px-4 py-3.5">Ingested</th>
                <th className="px-4 py-3.5">Skipped (Deduplicated)</th>
                <th className="px-4 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-slate-400">
                    Loading ingestion audit logs...
                  </td>
                </tr>
              ) : recentRuns.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-3.5 font-mono text-slate-400">#{r.id}</td>
                  <td className="px-4 py-3.5 font-semibold text-slate-900 dark:text-white">{r.source_name || `Source #${r.source_id}`}</td>
                  <td className="px-4 py-3.5 font-mono text-slate-500 dark:text-slate-400 text-[11px]">
                    {new Date(r.started_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3.5 font-mono text-slate-700 dark:text-slate-300">{r.total_processed.toLocaleString()}</td>
                  <td className="px-4 py-3.5 font-mono font-bold text-blue-600 dark:text-blue-400">
                    {r.records_ingested.toLocaleString()}
                  </td>
                  <td className="px-4 py-3.5 font-mono text-sky-600 dark:text-sky-400">
                    {r.records_skipped.toLocaleString()}
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                        r.status === 'completed'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/60'
                          : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/60'
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
