'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { fetchTrends } from '../lib/api';
import { TrendPoint } from '../types';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export const TrendsView: React.FC = () => {
  const [trends, setTrends] = useState<TrendPoint[]>([]);
  const [granularity, setGranularity] = useState<'yearly' | 'monthly'>('yearly');
  const [country, setCountry] = useState('All');
  const [sector, setSector] = useState('All');
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchTrends(country, sector, granularity);
      setTrends(data || []);
    } catch (e) {
      console.error('Failed to load trends:', e);
    } finally {
      setLoading(false);
    }
  }, [country, sector, granularity]);

  useEffect(() => {
    load();
  }, [load]);

  const validPoints = trends.filter((t) => !t.predicted);
  const totalVolume = validPoints.reduce((acc, p) => acc + p.count, 0);

  return (
    <div className="space-y-4">
      {/* Control Ribbon (Material Card) */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-[#131826] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.2)]">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Temporal Incident Trajectory & Trend Modeling
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Historical frequency aggregation, 3-period rolling moving average, and linear forecast projection.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Granularity switch (Material Segmented Control) */}
          <div className="flex rounded-full border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/80 p-0.5">
            <button
              onClick={() => setGranularity('yearly')}
              className={`rounded-full px-3 py-1 font-semibold transition-all ${
                granularity === 'yearly'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Yearly
            </button>
            <button
              onClick={() => setGranularity('monthly')}
              className={`rounded-full px-3 py-1 font-semibold transition-all ${
                granularity === 'monthly'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Monthly
            </button>
          </div>

          {/* Country filter */}
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="rounded-full border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/90 px-3 py-1.5 text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="All">All Geographies</option>
            <option value="India">India (National)</option>
            <option value="United States">United States</option>
            <option value="Germany">Germany</option>
            <option value="United Kingdom">United Kingdom</option>
            <option value="Russian Federation">Russia</option>
          </select>

          {/* Sector filter */}
          <select
            value={sector}
            onChange={(e) => setSector(e.target.value)}
            className="rounded-full border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/90 px-3 py-1.5 text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="All">All Sectors</option>
            <option value="Healthcare & Pharmaceuticals">Healthcare</option>
            <option value="Financial Services & Banking">Finance & Banking</option>
            <option value="Energy & Critical Utilities">Energy & Utilities</option>
            <option value="Government & Defense">Government & Defense</option>
            <option value="Information Technology & Telecom">IT & Telecom</option>
            <option value="Manufacturing & Industrial">Manufacturing</option>
            <option value="Education & Research">Education</option>
          </select>
        </div>
      </div>

      {/* Main Chart Container */}
      <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-[#131826] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.2)]">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Observed Volume:
            </span>
            <span className="text-sm font-black text-blue-600 dark:text-blue-400 font-mono">
              {totalVolume.toLocaleString()} incidents
            </span>
          </div>
          <div className="flex items-center space-x-3 text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span className="flex items-center space-x-1.5">
              <span className="h-2 w-2 rounded-full bg-blue-600" />
              <span>Incident Volume</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="h-2 w-2 rounded-full bg-sky-500" />
              <span>Moving Average</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              <span>Forecast</span>
            </span>
          </div>
        </div>

        {!mounted || loading ? (
          <div className="h-80 flex items-center justify-center text-xs text-slate-400 animate-pulse">
            Loading time series records...
          </div>
        ) : trends.length === 0 ? (
          <div className="h-80 flex items-center justify-center text-xs text-slate-400">
            No temporal records available for this filter combination.
          </div>
        ) : (
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="incidentGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.2} />
                <XAxis dataKey="period" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    fontSize: '11px',
                    color: '#f8fafc',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  name="Incident Count"
                  stroke="#2563eb"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#incidentGrad)"
                />
                <Line
                  type="monotone"
                  dataKey="moving_avg"
                  name="Rolling Trend"
                  stroke="#0284c7"
                  strokeWidth={2}
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};
