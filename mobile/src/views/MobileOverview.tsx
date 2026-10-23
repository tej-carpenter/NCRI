import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';
import { SummaryKPIs, TrendPoint, SectorStat, CyberIncident } from '../types';
import { KPICards } from '../components/KPICards';
import { calculateIncidentNCRI } from '../services/ncri_calculator';
import { NativeService } from '../services/native';
import { RefreshCw, ArrowRight } from 'lucide-react';

interface MobileOverviewProps {
  kpis: SummaryKPIs | null;
  trends: TrendPoint[];
  sectors: SectorStat[];
  recentIncidents: CyberIncident[];
  loading: boolean;
  onNavigateTab: (tab: string) => void;
  countryScope: string;
  setCountryScope: (scope: string) => void;
  onRefresh: () => void;
  onInspectIncident: (inc: CyberIncident) => void;
  isDark: boolean;
}

const SECTOR_COLORS = [
  '#2563eb', // Blue
  '#0284c7', // Sky
  '#0d9488', // Teal
  '#7c3aed', // Purple
  '#6366f1', // Indigo
  '#64748b', // Slate
];

export const MobileOverview: React.FC<MobileOverviewProps> = ({
  kpis,
  trends,
  sectors,
  recentIncidents,
  loading,
  onNavigateTab,
  countryScope,
  setCountryScope,
  onRefresh,
  onInspectIncident,
  isDark,
}) => {
  const scopes = ['All', 'India', 'United States', 'Germany', 'United Kingdom'];

  const safeTrends = Array.isArray(trends) && trends.length > 0 ? trends : [
    { period: '2018', count: 2 },
    { period: '2019', count: 3 },
    { period: '2020', count: 4 },
    { period: '2021', count: 5 },
    { period: '2022', count: 8 },
    { period: '2023', count: 105 },
    { period: '2024', count: 4 },
    { period: '2026', count: 216 },
    { period: '2027 (Forecast)', count: 130, predicted: true },
  ];

  const safeSectors = Array.isArray(sectors) && sectors.length > 0 ? sectors : [
    { sector: 'Transportation', count: 46, percentage: 21.3, avg_severity: 7.4, critical_count: 0 },
    { sector: 'Other / Unclassified', count: 42, percentage: 19.4, avg_severity: 7.4, critical_count: 0 },
    { sector: 'Information Technology', count: 28, percentage: 13.0, avg_severity: 7.5, critical_count: 0 },
    { sector: 'Education', count: 25, percentage: 11.6, avg_severity: 7.5, critical_count: 0 },
    { sector: 'Government', count: 19, percentage: 8.8, avg_severity: 7.6, critical_count: 0 },
    { sector: 'Healthcare', count: 18, percentage: 8.3, avg_severity: 7.8, critical_count: 8 },
  ];

  const gridColor = isDark ? '#1e293b' : '#e2e8f0';
  const textColor = isDark ? '#94a3b8' : '#64748b';

  return (
    <div className="space-y-4 pb-20">
      {/* Scope Selector Ribbon matching Web Screenshot 1 & 5 */}
      <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-[#131826] p-3 shadow-xs transition-colors duration-200">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Scope:</span>
            <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar py-0.5">
              {scopes.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    NativeService.hapticFeedback();
                    setCountryScope(s);
                  }}
                  className={`rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap transition-all ${
                    countryScope === s
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800'
                  }`}
                >
                  {s === 'All' ? 'Global Landscape' : s}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => {
              NativeService.hapticFeedback();
              onRefresh();
            }}
            disabled={loading}
            className="p-1.5 rounded-full border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 active:scale-95 transition shrink-0"
            title="Refresh metrics"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* 6 Material KPI Cards matching Web Screenshots */}
      <KPICards kpis={kpis} loading={loading} />

      {/* Trajectory (LINE GRAPH) & Sector (BAR GRAPH) Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* LINE GRAPH: Incident Trajectory (2014 – 2026) */}
        <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-[#131826] p-4 shadow-xs transition-colors duration-200">
          <div className="flex items-center justify-between pb-2">
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                Incident Trajectory (2014 – 2026)
              </h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Historical incident velocity with rolling baseline and active ransomware telemetry.
              </p>
            </div>
            <button
              onClick={() => {
                NativeService.hapticFeedback();
                onNavigateTab('trends');
              }}
              className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1 shrink-0"
            >
              <span>Full Trends</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="h-48 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={safeTrends} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="mobileTrendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="period"
                  stroke={textColor}
                  fontSize={9}
                  tickLine={false}
                  axisLine={{ stroke: gridColor }}
                />
                <YAxis
                  stroke={textColor}
                  fontSize={9}
                  tickLine={false}
                  axisLine={{ stroke: gridColor }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#0f172a' : '#ffffff',
                    borderColor: isDark ? '#334155' : '#cbd5e1',
                    borderRadius: '12px',
                    fontSize: '11px',
                    color: isDark ? '#f8fafc' : '#0f172a',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  name="Incidents"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#mobileTrendGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* BAR GRAPH: Target Sectors by Incident Share */}
        <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-[#131826] p-4 shadow-xs transition-colors duration-200">
          <div className="flex items-center justify-between pb-2">
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                Target Sectors by Incident Share
              </h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Empirical incident concentrations across critical and non-critical industrial classifications.
              </p>
            </div>
            <button
              onClick={() => {
                NativeService.hapticFeedback();
                onNavigateTab('sectors');
              }}
              className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1 shrink-0"
            >
              <span>Full Taxonomy</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="h-48 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={safeSectors.slice(0, 6)}
                layout="vertical"
                margin={{ top: 5, right: 15, left: 10, bottom: 0 }}
              >
                <XAxis type="number" stroke={textColor} fontSize={9} tickLine={false} axisLine={{ stroke: gridColor }} />
                <YAxis
                  type="category"
                  dataKey="sector"
                  stroke={textColor}
                  fontSize={8}
                  tickLine={false}
                  axisLine={{ stroke: gridColor }}
                  width={90}
                  tickFormatter={(val) => (val.length > 14 ? `${val.substring(0, 12)}…` : val)}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#0f172a' : '#ffffff',
                    borderColor: isDark ? '#334155' : '#cbd5e1',
                    borderRadius: '12px',
                    fontSize: '11px',
                    color: isDark ? '#f8fafc' : '#0f172a',
                  }}
                />
                <Bar dataKey="count" name="Incidents" radius={[0, 4, 4, 0]}>
                  {safeSectors.slice(0, 6).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={SECTOR_COLORS[index % SECTOR_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Incident Telemetry Table with Incident-Level NCRI Score */}
      <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-[#131826] p-4 shadow-xs transition-colors duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
              Recent Verified Incident Telemetry
            </h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              Latest incoming telemetry from multi-source data pipeline
            </p>
          </div>
          <button
            onClick={() => {
              NativeService.hapticFeedback();
              onNavigateTab('incidents');
            }}
            className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1"
          >
            <span>Explore All Incidents</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="mt-2 divide-y divide-slate-100 dark:divide-slate-800/80">
          {recentIncidents.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              {loading ? 'Loading incoming telemetry...' : 'No incidents found. Tap Refresh or Sync Sources.'}
            </div>
          ) : (
            recentIncidents.slice(0, 6).map((inc) => {
              const ncri = calculateIncidentNCRI(inc);
              return (
                <div
                  key={inc.id}
                  onClick={() => {
                    NativeService.hapticFeedback();
                    onInspectIncident(inc);
                  }}
                  className="py-3 flex items-center justify-between gap-2 hover:bg-slate-50 dark:hover:bg-slate-800/40 px-1 rounded-xl transition cursor-pointer"
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                        {inc.victim_name || inc.title || `Incident #${inc.incident_ref}`}
                      </span>
                      {/* NCRI Incident Score Badge */}
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 shrink-0">
                        NCRI {ncri.score.toFixed(1)}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full border shrink-0 ${
                          inc.severity === 'Critical'
                            ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border-rose-300 dark:border-rose-800'
                            : inc.severity === 'High'
                            ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-300 dark:border-amber-800'
                            : 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border-blue-300 dark:border-blue-800'
                        }`}
                      >
                        {inc.severity}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-slate-500 dark:text-slate-400">
                      <span>{inc.incident_date}</span>
                      <span>•</span>
                      <span className="truncate max-w-[120px]">{inc.sector}</span>
                      {inc.country && (
                        <>
                          <span>•</span>
                          <span className="truncate max-w-[100px]">{inc.country}</span>
                        </>
                      )}
                      {inc.threat_actor && (
                        <>
                          <span>•</span>
                          <span className="text-slate-400 dark:text-slate-300 truncate max-w-[90px]">
                            {inc.threat_actor}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      NativeService.hapticFeedback();
                      onInspectIncident(inc);
                    }}
                    className="px-2.5 py-1 rounded-full border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-white hover:bg-blue-600 dark:hover:bg-blue-600 text-[10px] font-semibold transition shrink-0"
                  >
                    Inspect
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
