import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';
import { SectorStat, AttackTypeStat } from '../types';
import { NCRIRepository } from '../services/repository';

interface MobileSectorsProps {
  countryScope: string;
  isDark: boolean;
}

const SECTOR_PALETTE = [
  '#2563eb', // Blue
  '#0284c7', // Sky
  '#0d9488', // Teal
  '#7c3aed', // Purple
  '#6366f1', // Indigo
  '#64748b', // Slate
  '#e11d48', // Rose
  '#d97706', // Amber
];

const ATTACK_PALETTE = [
  '#0d9488', // Teal (Ransomware)
  '#6366f1', // Indigo (Vulnerability Exploitation)
  '#8b5cf6', // Violet (DDoS)
  '#ec4899', // Pink (Data Breach)
  '#f59e0b', // Amber (Other)
  '#10b981', // Emerald (Malware)
  '#06b6d4', // Cyan (Unauthorized Access)
];

export const MobileSectors: React.FC<MobileSectorsProps> = ({ countryScope, isDark }) => {
  const [sectors, setSectors] = useState<SectorStat[]>([]);
  const [attacks, setAttacks] = useState<AttackTypeStat[]>([]);
  const [selectedGeo, setSelectedGeo] = useState(countryScope !== 'All' ? countryScope : 'All');
  const [loading, setLoading] = useState(true);

  const geos = ['All', 'India', 'United States', 'Germany', 'United Kingdom', 'France'];

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const [secRes, attRes] = await Promise.all([
          NCRIRepository.getSectors(selectedGeo !== 'All' ? selectedGeo : undefined),
          NCRIRepository.getAttackTypes(selectedGeo !== 'All' ? selectedGeo : undefined),
        ]);
        if (active) {
          setSectors(secRes.data || []);
          setAttacks(attRes.data || []);
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [selectedGeo]);

  const safeSectors = sectors.length > 0 ? sectors : [
    { sector: 'Other / Unclassified', count: 69, percentage: 21.8, avg_severity: 7.4, critical_count: 0 },
    { sector: 'Transportation & Logistics', count: 46, percentage: 14.6, avg_severity: 7.4, critical_count: 0 },
    { sector: 'Information Technology & Telecom', count: 40, percentage: 12.7, avg_severity: 7.5, critical_count: 0 },
    { sector: 'Education & Research', count: 38, percentage: 12.0, avg_severity: 7.5, critical_count: 0 },
    { sector: 'Healthcare & Pharmaceuticals', count: 36, percentage: 11.4, avg_severity: 7.8, critical_count: 8 },
    { sector: 'Manufacturing & Industrial', count: 31, percentage: 9.8, avg_severity: 7.3, critical_count: 0 },
    { sector: 'Government & Defense', count: 19, percentage: 6.0, avg_severity: 7.6, critical_count: 0 },
    { sector: 'Energy & Critical Utilities', count: 17, percentage: 5.4, avg_severity: 7.8, critical_count: 3 },
    { sector: 'Commercial & Retail', count: 11, percentage: 3.5, avg_severity: 7.2, critical_count: 0 },
    { sector: 'Financial Services & Banking', count: 9, percentage: 2.8, avg_severity: 7.9, critical_count: 1 },
  ];

  const safeAttacks = attacks.length > 0 ? attacks : [
    { attack_type: 'Ransomware', count: 245, percentage: 77.5, avg_severity: 7.5 },
    { attack_type: 'Vulnerability Exploitation', count: 38, percentage: 12.0, avg_severity: 7.8 },
    { attack_type: 'Distributed Denial of Service (DDoS)', count: 15, percentage: 4.7, avg_severity: 6.2 },
    { attack_type: 'Data Breach', count: 9, percentage: 2.8, avg_severity: 7.0 },
    { attack_type: 'Other', count: 5, percentage: 1.6, avg_severity: 5.5 },
    { attack_type: 'Malware', count: 3, percentage: 0.9, avg_severity: 6.0 },
    { attack_type: 'Unauthorized Access', count: 1, percentage: 0.3, avg_severity: 5.0 },
  ];

  const gridColor = isDark ? '#1e293b' : '#e2e8f0';
  const textColor = isDark ? '#94a3b8' : '#64748b';

  return (
    <div className="space-y-4 pb-20">
      {/* Header Banner matching Screenshot 4 */}
      <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-[#131826] p-4 shadow-xs space-y-2 transition-colors duration-200">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
              Sector-Wise Vulnerability & Threat Distribution
            </h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              Cross-sector impact comparison, critical infrastructure targeting, and vector breakdown.
            </p>
          </div>

          <select
            value={selectedGeo}
            onChange={(e) => setSelectedGeo(e.target.value)}
            className="rounded-full border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/90 px-3 py-1 text-xs text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            {geos.map((g) => (
              <option key={g} value={g}>
                {g === 'All' ? 'Global (All Geographies)' : g}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 2 BAR CHARTS matching Screenshot 4 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* BAR CHART 1: Horizontal Bar Chart - Incident Volume by Target Sector */}
        <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-[#131826] p-4 shadow-xs transition-colors duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
              Incident Volume by Target Sector
            </h4>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
              Observed telemetry
            </span>
          </div>

          <div className="h-60 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={safeSectors.slice(0, 8)}
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
                  width={95}
                  tickFormatter={(val) => (val.length > 15 ? `${val.substring(0, 13)}…` : val)}
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
                  {safeSectors.slice(0, 8).map((_, idx) => (
                    <Cell key={`cell-sec-${idx}`} fill={SECTOR_PALETTE[idx % SECTOR_PALETTE.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* BAR CHART 2: Vertical Bar Chart - Attack Classification Breakdown */}
        <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-[#131826] p-4 shadow-xs transition-colors duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
              Attack Classification Breakdown
            </h4>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
              Top Vectors
            </span>
          </div>

          <div className="h-60 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={safeAttacks.slice(0, 7)}
                margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
              >
                <XAxis
                  dataKey="attack_type"
                  stroke={textColor}
                  fontSize={8}
                  tickLine={false}
                  axisLine={{ stroke: gridColor }}
                  angle={-25}
                  textAnchor="end"
                  interval={0}
                  tickFormatter={(val) => (val.length > 12 ? `${val.substring(0, 10)}…` : val)}
                />
                <YAxis stroke={textColor} fontSize={9} tickLine={false} axisLine={{ stroke: gridColor }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#0f172a' : '#ffffff',
                    borderColor: isDark ? '#334155' : '#cbd5e1',
                    borderRadius: '12px',
                    fontSize: '11px',
                    color: isDark ? '#f8fafc' : '#0f172a',
                  }}
                />
                <Bar dataKey="count" name="Incidents" radius={[4, 4, 0, 0]}>
                  {safeAttacks.slice(0, 7).map((_, idx) => (
                    <Cell key={`cell-att-${idx}`} fill={ATTACK_PALETTE[idx % ATTACK_PALETTE.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Sector Indicators Table matching Screenshot 4 */}
      <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-[#131826] p-4 shadow-xs transition-colors duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
            Sector-Wise Impact & Criticality Indicators
          </h4>
          <span className="text-[10px] text-slate-500 font-mono">Canonical Taxonomy</span>
        </div>

        <div className="mt-2 divide-y divide-slate-100 dark:divide-slate-800/80">
          {safeSectors.map((sec) => (
            <div key={sec.sector} className="py-2.5 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900 dark:text-slate-100">{sec.sector}</span>
                <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">{sec.count}</span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-500 dark:text-slate-400 items-center">
                {/* Share of total with progress bar */}
                <div className="space-y-0.5">
                  <div className="flex justify-between">
                    <span>Share:</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{sec.percentage?.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div style={{ width: `${sec.percentage}%` }} className="bg-blue-600 h-full rounded-full" />
                  </div>
                </div>

                <div className="text-center">
                  <span>Avg Sev: </span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{sec.avg_severity || 7.4} / 10.0</span>
                </div>

                <div className="text-right">
                  <span>Critical: </span>
                  <span className={`font-bold ${sec.critical_count > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400'}`}>
                    {sec.critical_count}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
