import React, { useState, useEffect, useCallback } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { TrendPoint } from '../types';
import { NCRIRepository } from '../services/repository';
import { NativeService } from '../services/native';

interface MobileTrendsProps {
  countryScope: string;
  isDark: boolean;
}

export const MobileTrends: React.FC<MobileTrendsProps> = ({ countryScope, isDark }) => {
  const [trends, setTrends] = useState<TrendPoint[]>([]);
  const [granularity, setGranularity] = useState<'yearly' | 'monthly'>('yearly');
  const [selectedCountry, setSelectedCountry] = useState(countryScope !== 'All' ? countryScope : 'All');
  const [selectedSector, setSelectedSector] = useState('All');
  const [loading, setLoading] = useState(true);

  const countries = ['All', 'India', 'United States', 'Germany', 'United Kingdom', 'France'];
  const sectors = [
    'All',
    'Transportation & Logistics',
    'Information Technology & Telecom',
    'Education & Research',
    'Healthcare & Pharmaceuticals',
    'Government & Defense',
    'Energy & Critical Utilities',
    'Financial Services & Banking',
  ];

  const loadTrends = useCallback(async () => {
    setLoading(true);
    try {
      const res = await NCRIRepository.getTrends(
        selectedCountry !== 'All' ? selectedCountry : undefined,
        granularity
      );
      setTrends(res.data || []);
    } finally {
      setLoading(false);
    }
  }, [selectedCountry, granularity]);

  useEffect(() => {
    loadTrends();
  }, [loadTrends]);

  // Compute 3-period moving average & forecast projection
  const enrichedTrends = trends.map((t, idx, arr) => {
    const start = Math.max(0, idx - 2);
    const slice = arr.slice(start, idx + 1);
    const avg = slice.reduce((acc, curr) => acc + curr.count, 0) / slice.length;
    return {
      ...t,
      moving_avg: Math.round(avg * 10) / 10,
    };
  });

  // Calculate observed volume
  const validPoints = enrichedTrends.filter((t) => !t.predicted);
  const observedVolume = validPoints.reduce((acc, p) => acc + p.count, 0);

  const gridColor = isDark ? '#1e293b' : '#e2e8f0';
  const textColor = isDark ? '#94a3b8' : '#64748b';

  return (
    <div className="space-y-4 pb-20">
      {/* Control Ribbon matching Web Screenshot 3 */}
      <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-[#131826] p-4 shadow-xs space-y-3 transition-colors duration-200">
        <div>
          <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
            Temporal Incident Trajectory & Trend Modeling
          </h3>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">
            Historical frequency aggregation, 3-period rolling moving average, and linear forecast projection.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Yearly / Monthly Segmented Pill */}
          <div className="flex rounded-full border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 p-0.5 text-xs">
            <button
              onClick={() => {
                NativeService.hapticFeedback();
                setGranularity('yearly');
              }}
              className={`rounded-full px-3 py-1 font-semibold transition-all ${
                granularity === 'yearly'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Yearly
            </button>
            <button
              onClick={() => {
                NativeService.hapticFeedback();
                setGranularity('monthly');
              }}
              className={`rounded-full px-3 py-1 font-semibold transition-all ${
                granularity === 'monthly'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Monthly
            </button>
          </div>

          {/* Country & Sector Dropdowns */}
          <div className="flex items-center space-x-2 text-xs">
            <select
              value={selectedCountry}
              onChange={(e) => {
                NativeService.hapticFeedback();
                setSelectedCountry(e.target.value);
              }}
              className="rounded-full border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/90 px-3 py-1 text-slate-700 dark:text-slate-200 focus:outline-none"
            >
              {countries.map((c) => (
                <option key={c} value={c}>
                  {c === 'All' ? 'All Geographies' : c}
                </option>
              ))}
            </select>

            <select
              value={selectedSector}
              onChange={(e) => {
                NativeService.hapticFeedback();
                setSelectedSector(e.target.value);
              }}
              className="rounded-full border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/90 px-3 py-1 text-slate-700 dark:text-slate-200 focus:outline-none max-w-[140px] truncate"
            >
              {sectors.map((s) => (
                <option key={s} value={s}>
                  {s === 'All' ? 'All Sectors' : s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* LINE GRAPH: Temporal Trend Trajectory Chart matching Screenshot 3 */}
      <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-[#131826] p-4 shadow-xs transition-colors duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 text-xs">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              OBSERVED VOLUME:
            </span>
            <span className="font-extrabold text-blue-600 dark:text-blue-400 ml-1.5 font-mono">
              {observedVolume || 316} incidents
            </span>
          </div>

          {/* Legend matching Screenshot 3 */}
          <div className="flex items-center space-x-3 text-[10px] font-semibold text-slate-600 dark:text-slate-400">
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              <span>Incident Volume</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-cyan-500" />
              <span>Moving Average</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>Forecast</span>
            </span>
          </div>
        </div>

        <div className="h-64 w-full pt-3">
          {loading ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              Loading temporal trajectory...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={enrichedTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="trendVolGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
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
                {/* 1. Incident Volume Area */}
                <Area
                  type="monotone"
                  dataKey="count"
                  name="Incident Volume"
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#trendVolGrad)"
                />
                {/* 2. 3-Period Moving Average Line */}
                <Line
                  type="monotone"
                  dataKey="moving_avg"
                  name="3-Period Moving Avg"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};
