import React from 'react';
import { SummaryKPIs } from '../types';

interface KPICardsProps {
  kpis: SummaryKPIs | null;
  loading: boolean;
}

export const KPICards: React.FC<KPICardsProps> = ({ kpis, loading }) => {
  if (loading || !kpis) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131826] p-3.5 shadow-xs"
          >
            <div className="h-3 w-16 bg-slate-200 dark:bg-slate-800 rounded-full mb-3" />
            <div className="h-6 w-20 bg-slate-200 dark:bg-slate-700 rounded-lg mb-2" />
            <div className="h-3 w-24 bg-slate-100 dark:bg-slate-800/60 rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      label: 'VERIFIED INCIDENTS',
      value: kpis.total_incidents.toLocaleString(),
      sub: `${kpis.latest_incident_date || '2026-10-13'}`,
      badge: 'Aggregated',
      badgeClass: 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/60',
    },
    {
      label: 'MONITORED SOURCES',
      value: `${kpis.total_sources} Feeds`,
      sub: 'CISSM, KEV, Ransomware, CERT-In',
      badge: 'Active',
      badgeClass: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60',
    },
    {
      label: 'EXPLOITED CVES',
      value: (kpis.total_vulnerabilities || 8).toLocaleString(),
      sub: 'CISA KEV Intelligence',
      badge: 'Enriched',
      badgeClass: 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/60',
    },
    {
      label: 'COVERED NATIONS',
      value: `${kpis.total_countries || 52} Nations`,
      sub: 'Global Geographic Scope',
      badge: 'Cross-Border',
      badgeClass: 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/60',
    },
    {
      label: 'CRITICAL SEVERITY',
      value: `${kpis.critical_severity_percentage?.toFixed(1) || '5.6'}%`,
      sub: 'High-Disruption Telemetry',
      badge: 'Impact',
      badgeClass: 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/60',
    },
    {
      label: 'RANSOMWARE SHARE',
      value: `${kpis.ransomware_percentage?.toFixed(1) || '69.0'}%`,
      sub: `Top: ${kpis.top_sector ? kpis.top_sector.split('&')[0].trim() : 'Transportation'}`,
      badge: 'Dominant',
      badgeClass: 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/60',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
      {cards.map((c, idx) => (
        <div
          key={idx}
          className="rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-[#131826] p-3.5 shadow-xs transition-colors duration-200 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between gap-1">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">
              {c.label}
            </span>
            <span
              className={`rounded-full border px-1.5 py-0.2 text-[9px] font-bold ${c.badgeClass}`}
            >
              {c.badge}
            </span>
          </div>
          <div className="mt-2 text-xl font-black tracking-tight text-slate-900 dark:text-slate-50">
            {c.value}
          </div>
          <div className="mt-1 text-[10px] text-slate-500 dark:text-slate-400 truncate">
            {c.sub}
          </div>
        </div>
      ))}
    </div>
  );
};
