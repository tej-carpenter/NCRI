'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { fetchSectors, fetchAttackTypes } from '../lib/api';
import { SectorStat, AttackTypeStat } from '../types';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';

const MATERIAL_COLORS = [
  '#2563eb', '#0284c7', '#0d9488', '#4f46e5',
  '#7c3aed', '#ec4899', '#f59e0b', '#dc2626', '#059669', '#64748b'
];

export const SectorView: React.FC = () => {
  const [sectors, setSectors] = useState<SectorStat[]>([]);
  const [attackTypes, setAttackTypes] = useState<AttackTypeStat[]>([]);
  const [country, setCountry] = useState('All');
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [secRes, atkRes] = await Promise.allSettled([
        fetchSectors(country),
        fetchAttackTypes(country),
      ]);
      if (secRes.status === 'fulfilled') {
        setSectors(secRes.value || []);
      } else {
        console.error('Failed to load sectors:', secRes.reason);
      }
      if (atkRes.status === 'fulfilled') {
        setAttackTypes(atkRes.value || []);
      } else {
        console.error('Failed to load attack types:', atkRes.reason);
      }
    } catch (e) {
      console.error('Failed to load sector stats:', e);
    } finally {
      setLoading(false);
    }
  }, [country]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-6">
      {/* Header ribbon (Material Surface Card) */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-[#131826] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.2)]">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Sector-Wise Vulnerability & Threat Distribution
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Cross-sector impact comparison, critical infrastructure targeting, and vector breakdown.
          </p>
        </div>

        <select
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="rounded-full border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/90 px-3.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500"
        >
          <option value="All">Global (All Geographies)</option>
          <option value="India">India (National Cyber Landscape)</option>
          <option value="United States">United States</option>
          <option value="Germany">Germany</option>
          <option value="United Kingdom">United Kingdom</option>
          <option value="Russian Federation">Russian Federation</option>
        </select>
      </div>

      {/* Grid with 2 Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Sector Incident Volume */}
        <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-[#131826] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.2)]">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Incident Volume by Target Sector
            </h4>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">
              Observed telemetry
            </span>
          </div>

          {!mounted || loading ? (
            <div className="h-72 flex items-center justify-center text-xs text-slate-400 animate-pulse">
              Loading sectors...
            </div>
          ) : sectors.length === 0 ? (
            <div className="h-72 flex items-center justify-center text-xs text-slate-400">
              No sector records found for selected scope.
            </div>
          ) : (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sectors} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.2} />
                  <XAxis type="number" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                  <YAxis
                    type="category"
                    dataKey="sector"
                    stroke="#94a3b8"
                    width={130}
                    tick={{ fontSize: 10 }}
                    tickFormatter={(val) => val.split('&')[0].trim()}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      color: '#f8fafc',
                      fontSize: '11px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                  <Bar dataKey="count" name="Incidents" radius={[0, 6, 6, 0]}>
                    {sectors.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={MATERIAL_COLORS[index % MATERIAL_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Attack Vector Distribution */}
        <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-[#131826] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.2)]">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Attack Classification Breakdown
            </h4>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">
              Top Vectors
            </span>
          </div>

          {!mounted || loading ? (
            <div className="h-72 flex items-center justify-center text-xs text-slate-400 animate-pulse">
              Loading attack types...
            </div>
          ) : attackTypes.length === 0 ? (
            <div className="h-72 flex items-center justify-center text-xs text-slate-400">
              No attack type records found for selected scope.
            </div>
          ) : (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attackTypes} margin={{ top: 10, right: 20, left: 10, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.2} />
                  <XAxis
                    dataKey="attack_type"
                    stroke="#94a3b8"
                    tick={{ fontSize: 10 }}
                    angle={-25}
                    textAnchor="end"
                    interval={0}
                    tickFormatter={(val) => val.split('&')[0].split('/')[0].trim()}
                  />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      color: '#f8fafc',
                      fontSize: '11px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                  <Bar dataKey="count" name="Incidents" fill="#2563eb" radius={[6, 6, 0, 0]}>
                    {attackTypes.map((_, index) => (
                      <Cell key={`atk-${index}`} fill={MATERIAL_COLORS[(index + 2) % MATERIAL_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Sector Summary Table (Material Data Table) */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-[#131826] shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.2)]">
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 flex items-center justify-between">
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Sector-Wise Impact & Criticality Indicators
          </h4>
          <span className="text-xs text-slate-500 dark:text-slate-400">Canonical Taxonomy</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Sector</th>
                <th className="px-4 py-3">Incident Count</th>
                <th className="px-4 py-3">Share of Total</th>
                <th className="px-4 py-3">Avg Severity Score</th>
                <th className="px-4 py-3">Critical Incidents</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {sectors.map((s, idx) => (
                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-100">{s.sector}</td>
                  <td className="px-4 py-3 font-mono font-bold text-blue-600 dark:text-blue-400">{s.count.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <div className="h-1.5 w-16 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 dark:bg-blue-500 rounded-full" style={{ width: `${Math.min(100, s.percentage * 3)}%` }} />
                      </div>
                      <span className="font-mono text-slate-500 dark:text-slate-400">{s.percentage}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-700 dark:text-slate-300">{s.avg_severity} / 10.0</td>
                  <td className="px-4 py-3 font-mono font-semibold text-rose-600 dark:text-rose-400">{s.critical_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
