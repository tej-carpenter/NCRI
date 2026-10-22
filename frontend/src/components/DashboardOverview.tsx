'use client';

import React, { useState, useEffect } from 'react';
import { SummaryKPIs, TrendPoint, SectorStat, CyberIncident } from '../types';
import { KPICards } from './KPICards';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';

interface DashboardOverviewProps {
  kpis: SummaryKPIs | null;
  trends: TrendPoint[];
  sectors: SectorStat[];
  recentIncidents: CyberIncident[];
  loading: boolean;
  onNavigateTab: (tab: string) => void;
  countryScope: string;
  setCountryScope: (scope: string) => void;
}

const MATERIAL_COLORS = [
  '#2563eb', // Blue
  '#0284c7', // Sky
  '#0d9488', // Teal
  '#4f46e5', // Indigo
  '#7c3aed', // Violet
  '#64748b', // Slate
];

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  kpis,
  trends,
  sectors,
  recentIncidents,
  loading,
  onNavigateTab,
  countryScope,
  setCountryScope,
}) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="space-y-6">
      {/* Scope Selector Ribbon (Material Segmented Control) */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-[#131826] p-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.2)]">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            Scope:
          </span>
          <div className="flex flex-wrap rounded-full border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/80 p-0.5 text-xs">
            {['All', 'India', 'United States', 'Germany', 'United Kingdom'].map((c) => (
              <button
                key={c}
                onClick={() => setCountryScope(c)}
                className={`rounded-full px-3 py-1 font-semibold transition-all ${
                  countryScope === c
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {c === 'All' ? 'Global Landscape' : c}
              </button>
            ))}
          </div>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400">
          Normalized telemetry across 5 authenticated feeds
        </div>
      </div>

      {/* KPI Cards Row */}
      <KPICards kpis={kpis} loading={loading} />

      {/* Two Column Visual Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Temporal Trajectory Preview */}
        <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-[#131826] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.2)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                Incident Trajectory (2014 – 2026)
              </h4>
              <button
                onClick={() => onNavigateTab('trends')}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Full Trends
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Historical incident velocity with rolling baseline and active ransomware telemetry.
            </p>

            <div className="h-64 w-full">
              {!mounted || loading ? (
                <div className="h-full w-full flex items-center justify-center text-xs text-slate-400 animate-pulse">
                  Loading incident trajectory...
                </div>
              ) : trends.length === 0 ? (
                <div className="h-full w-full flex items-center justify-center text-xs text-slate-400">
                  No trajectory data available for the selected scope.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trends.slice(-10)} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="dashGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.2} />
                    <XAxis dataKey="period" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                    <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} />
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
                    <Area
                      type="monotone"
                      dataKey="count"
                      name="Incidents"
                      stroke="#2563eb"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#dashGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* Sector Volume Preview */}
        <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-[#131826] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.2)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                Target Sectors by Incident Share
              </h4>
              <button
                onClick={() => onNavigateTab('sectors')}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Full Taxonomy
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Empirical incident concentrations across critical and non-critical industrial classifications.
            </p>

            <div className="h-64 w-full">
              {!mounted || loading ? (
                <div className="h-full w-full flex items-center justify-center text-xs text-slate-400 animate-pulse">
                  Loading sector breakdown...
                </div>
              ) : sectors.length === 0 ? (
                <div className="h-full w-full flex items-center justify-center text-xs text-slate-400">
                  No sector distribution data available for the selected scope.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sectors.slice(0, 6)} layout="vertical" margin={{ top: 5, right: 20, left: 35, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.2} />
                    <XAxis type="number" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                    <YAxis
                      type="category"
                      dataKey="sector"
                      stroke="#94a3b8"
                      width={110}
                      tick={{ fontSize: 9 }}
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
                      {sectors.slice(0, 6).map((_, idx) => (
                        <Cell key={`bar-${idx}`} fill={MATERIAL_COLORS[idx % MATERIAL_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Incidents Telemetry Stream (Material Data Table) */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-[#131826] shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.2)]">
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Recent Verified Incident Telemetry
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Latest incoming telemetry from multi-source data pipeline
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('incidents')}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            Explore All Incidents
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Target Organization</th>
                <th className="px-4 py-3">Sector</th>
                <th className="px-4 py-3">Country</th>
                <th className="px-4 py-3">Vector</th>
                <th className="px-4 py-3">Threat Actor</th>
                <th className="px-4 py-3">Severity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {recentIncidents.slice(0, 6).map((inc) => (
                <tr
                  key={inc.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="px-4 py-3 font-mono text-slate-500 dark:text-slate-400 whitespace-nowrap text-[11px]">
                    {inc.incident_date}
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white max-w-xs truncate">
                    {inc.victim_name || 'Target Entity'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-slate-600 dark:text-slate-300">
                    {inc.sector}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-slate-600 dark:text-slate-300">
                    {inc.country || 'Unknown'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-medium text-[11px]">
                      {inc.attack_type}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-slate-500 dark:text-slate-400 max-w-[120px] truncate">
                    {inc.threat_actor || '—'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${
                        inc.severity === 'Critical'
                          ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/60'
                          : inc.severity === 'High'
                          ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/60'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/60'
                      }`}
                    >
                      {inc.severity}
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
