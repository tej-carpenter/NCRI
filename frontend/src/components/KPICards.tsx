'use client';

import React from 'react';
import { SummaryKPIs } from '../types';

interface KPICardsProps {
  kpis: SummaryKPIs | null;
  loading: boolean;
}

export const KPICards: React.FC<KPICardsProps> = ({ kpis, loading }) => {
  if (loading || !kpis) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131826] p-4 shadow-xs"
          >
            <div className="h-3 w-16 bg-slate-200 dark:bg-slate-800 rounded-full mb-3" />
            <div className="h-7 w-24 bg-slate-200 dark:bg-slate-700 rounded-lg mb-2" />
            <div className="h-3 w-20 bg-slate-100 dark:bg-slate-800/60 rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      label: 'Verified Incidents',
      value: kpis.total_incidents.toLocaleString(),
      sub: `${kpis.latest_incident_date || 'Live updates'}`,
      badge: 'Aggregated',
      badgeClass: 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/60',
    },
    {
      label: 'Monitored Sources',
      value: `${kpis.total_sources} Feeds`,
      sub: 'CISSM, KEV, Ransomware, CERT-In',
      badge: 'Active',
      badgeClass: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60',
    },
    {
      label: 'Exploited CVEs',
      value: kpis.total_vulnerabilities.toLocaleString(),
      sub: 'CISA KEV Intelligence',
      badge: 'Enriched',
      badgeClass: 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/60',
    },
    {
      label: 'Covered Nations',
      value: `${kpis.total_countries} Nations`,
      sub: 'Global Geographic Scope',
      badge: 'Cross-Border',
      badgeClass: 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/60',
    },
    {
      label: 'Critical Severity',
      value: `${kpis.critical_severity_percentage}%`,
      sub: 'High-Disruption Telemetry',
      badge: 'Impact',
      badgeClass: 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/60',
    },
    {
      label: 'Ransomware Share',
      value: `${kpis.ransomware_percentage}%`,
      sub: `Top: ${kpis.top_sector ? kpis.top_sector.split('&')[0].trim() : 'Healthcare'}`,
      badge: 'Dominant',
      badgeClass: 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/60',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
      {cards.map((c, idx) => (
        <div
          key={idx}
          className="rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-[#131826] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.2)] hover:shadow-md transition-all duration-200 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between gap-1">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">
              {c.label}
            </span>
            <span
              className={`rounded-full border px-1.5 py-0.2 text-[9px] font-semibold ${c.badgeClass}`}
            >
              {c.badge}
            </span>
          </div>
          <div className="mt-2 text-2xl font-black tracking-tight text-slate-900 dark:text-slate-50">
            {c.value}
          </div>
          <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 truncate">
            {c.sub}
          </div>
        </div>
      ))}
    </div>
  );
};
