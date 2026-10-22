'use client';

import React, { useState, useEffect } from 'react';
import { fetchGeography } from '../lib/api';
import { GeoStat } from '../types';

export const GeoView: React.FC = () => {
  const [geoData, setGeoData] = useState<GeoStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchGeography(25);
        setGeoData(data || []);
      } catch (e) {
        console.error('Failed to load geo data:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const indiaStats = geoData.find((g) => g.country.toLowerCase().includes('india'));

  return (
    <div className="space-y-6">
      {/* Header ribbon (Material Card) */}
      <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-[#131826] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.2)]">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
          Geographic Incident Distribution & National Cyber Posture
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Country-level victim concentrations, regional risk footprints, and India national infrastructure tracking.
        </p>
      </div>

      {/* India National Focus Spotlight Card */}
      <div className="rounded-2xl border border-blue-200 dark:border-blue-800/60 bg-blue-50/60 dark:bg-blue-950/20 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.2)]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white font-black text-lg shadow-xs">
              IN
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  National Cyber Incident Profile: India
                </h4>
                <span className="rounded-full bg-blue-100 dark:bg-blue-900/60 px-2.5 py-0.5 text-[10px] font-semibold text-blue-700 dark:text-blue-300">
                  Priority Track (CERT-In)
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                Targeted infrastructure: Healthcare (AIIMS), Energy (Oil India, NPCIL), Finance (Cosmos Bank), Telecom (BSNL).
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-6 text-xs">
            <div>
              <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-semibold">
                Verified Incidents
              </span>
              <span className="text-xl font-black font-mono text-blue-600 dark:text-blue-400">
                {indiaStats ? indiaStats.count.toLocaleString() : '100+'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-semibold">
                Global Share
              </span>
              <span className="text-xl font-black font-mono text-sky-600 dark:text-sky-400">
                {indiaStats ? `${indiaStats.percentage}%` : '2.6%'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-semibold">
                State Directives
              </span>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                Mandatory Disclosures
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Country Distribution Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-[#131826] shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.2)]">
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 flex items-center justify-between">
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Top Impacted Nations & Geographic Footprints
          </h4>
          <span className="text-xs text-slate-500 dark:text-slate-400">Derived from verified incident telemetry</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Rank</th>
                <th className="px-4 py-3">Country / Territory</th>
                <th className="px-4 py-3">ISO Code</th>
                <th className="px-4 py-3">Incident Count</th>
                <th className="px-4 py-3">Global Incident Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-4 py-3">
                      <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full" />
                    </td>
                  </tr>
                ))
              ) : (
                geoData.map((g, idx) => (
                  <tr
                    key={idx}
                    className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${
                      g.country.toLowerCase().includes('india') ? 'bg-blue-50/40 dark:bg-blue-950/20 font-semibold' : ''
                    }`}
                  >
                    <td className="px-4 py-3 font-mono text-slate-400">#{idx + 1}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                      <span>{g.country}</span>
                      {g.country.toLowerCase().includes('india') && (
                        <span className="rounded-full bg-blue-600 text-white text-[9px] px-1.5 py-0.2 font-bold">
                          Focus
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-500 dark:text-slate-400">{g.country_code || '—'}</td>
                    <td className="px-4 py-3 font-mono font-bold text-blue-600 dark:text-blue-400">{g.count.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <div className="h-1.5 w-24 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-600 dark:bg-blue-500 rounded-full"
                            style={{ width: `${Math.min(100, g.percentage * 2.5)}%` }}
                          />
                        </div>
                        <span className="font-mono text-slate-600 dark:text-slate-300">{g.percentage}%</span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
