import React, { useState, useEffect } from 'react';
import { Search, Download, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { CyberIncident } from '../types';
import { NCRIRepository } from '../services/repository';
import { calculateIncidentNCRI } from '../services/ncri_calculator';
import { NativeService } from '../services/native';

interface MobileIncidentsProps {
  countryScope: string;
  onInspectIncident: (inc: CyberIncident) => void;
  onExportCsv: () => void;
}

export const MobileIncidents: React.FC<MobileIncidentsProps> = ({
  countryScope,
  onInspectIncident,
  onExportCsv,
}) => {
  const [incidents, setIncidents] = useState<CyberIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSector, setSelectedSector] = useState('All');
  const [selectedCountry, setSelectedCountry] = useState(countryScope !== 'All' ? countryScope : 'All');
  const [selectedAttackType, setSelectedAttackType] = useState('All');
  const [selectedSeverity, setSelectedSeverity] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  const [sortBy, setSortBy] = useState('Newest Date');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const sectors = [
    'All',
    'Healthcare & Pharmaceuticals',
    'Financial Services & Banking',
    'Government & Defense',
    'Information Technology & Telecom',
    'Transportation & Logistics',
    'Energy & Critical Utilities',
    'Manufacturing & Industrial',
    'Education & Research',
    'Commercial & Retail',
    'Other / Unclassified',
  ];

  const countries = ['All', 'United States', 'United Kingdom', 'Germany', 'France', 'India', 'Italy', 'Canada'];
  const attackTypes = ['All', 'Ransomware & Extortion', 'Vulnerability Exploitation', 'Data Breach', 'Distributed Denial of Service (DDoS)', 'Supply Chain Attack'];
  const severities = ['All', 'Critical', 'High', 'Medium', 'Low'];
  const years = ['All', '2026', '2024', '2023', '2022', '2021', '2020'];

  const loadIncidents = async () => {
    setLoading(true);
    try {
      const res = await NCRIRepository.getIncidents({
        page,
        size: 15,
        search: search.trim() || undefined,
        sector: selectedSector !== 'All' ? selectedSector : undefined,
        country: selectedCountry !== 'All' ? selectedCountry : undefined,
        attack_type: selectedAttackType !== 'All' ? selectedAttackType : undefined,
        severity: selectedSeverity !== 'All' ? selectedSeverity : undefined,
        year: selectedYear !== 'All' ? parseInt(selectedYear) : undefined,
      });
      setIncidents(res.data.items || []);
      setTotalPages(res.data.pages || 1);
      setTotalCount(res.data.total || 0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIncidents();
  }, [page, selectedSector, selectedCountry, selectedAttackType, selectedSeverity, selectedYear]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadIncidents();
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Search & Filter Controls matching Web Screenshot 2 */}
      <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-[#131826] p-3.5 shadow-xs space-y-3 transition-colors duration-200">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search victim organization..."
              className="w-full rounded-full border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/90 py-2 pl-9 pr-8 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setPage(1);
                }}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500 transition active:scale-95 shadow-xs"
          >
            Search
          </button>
        </form>

        {/* Filter Dropdowns matching Screenshot 2 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
          <select
            value={selectedSector}
            onChange={(e) => {
              setSelectedSector(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/90 px-2.5 py-1.5 text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            {sectors.map((s) => (
              <option key={s} value={s}>
                {s === 'All' ? 'All Sectors' : s}
              </option>
            ))}
          </select>

          <select
            value={selectedCountry}
            onChange={(e) => {
              setSelectedCountry(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/90 px-2.5 py-1.5 text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            {countries.map((c) => (
              <option key={c} value={c}>
                {c === 'All' ? 'All Countries' : c}
              </option>
            ))}
          </select>

          <select
            value={selectedAttackType}
            onChange={(e) => {
              setSelectedAttackType(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/90 px-2.5 py-1.5 text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            {attackTypes.map((a) => (
              <option key={a} value={a}>
                {a === 'All' ? 'All Attack Types' : a}
              </option>
            ))}
          </select>

          <select
            value={selectedSeverity}
            onChange={(e) => {
              setSelectedSeverity(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/90 px-2.5 py-1.5 text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            {severities.map((sev) => (
              <option key={sev} value={sev}>
                {sev === 'All' ? 'All Severities' : sev}
              </option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => {
              setSelectedYear(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/90 px-2.5 py-1.5 text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y === 'All' ? 'All Years' : y}
              </option>
            ))}
          </select>

          <button
            onClick={onExportCsv}
            className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold px-2.5 py-1.5 flex items-center justify-center space-x-1 hover:bg-slate-200 dark:hover:bg-slate-700"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Incident List matching Table in Screenshot 2 */}
      <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-[#131826] p-4 shadow-xs space-y-3 transition-colors duration-200">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pb-2 border-b border-slate-200 dark:border-slate-800">
          <span>Showing {incidents.length} of {totalCount} incidents</span>
          <span>Page {page} of {totalPages || 1}</span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading incident records...</div>
        ) : incidents.length === 0 ? (
          <div className="py-10 text-center text-xs text-slate-500">
            No incidents found matching current filters.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {incidents.map((inc) => {
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
                      {/* NCRI Incident Score Pill */}
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 shrink-0">
                        NCRI {ncri.score.toFixed(1)}
                      </span>
                      {/* Severity Pill */}
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
                      {inc.attack_type && (
                        <>
                          <span>•</span>
                          <span className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {inc.attack_type}
                          </span>
                        </>
                      )}
                      {inc.threat_actor && (
                        <>
                          <span>•</span>
                          <span className="text-slate-400 dark:text-slate-300">
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
                    className="px-3 py-1 rounded-full border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-white hover:bg-blue-600 dark:hover:bg-blue-600 text-[11px] font-semibold transition shrink-0"
                  >
                    Inspect
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Controls matching Screenshot 2 */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={() => {
                NativeService.hapticFeedback();
                setPage((p) => Math.max(1, p - 1));
              }}
              disabled={page <= 1}
              className="px-3 py-1.5 rounded-full border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-xs text-slate-500 font-semibold">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => {
                NativeService.hapticFeedback();
                setPage((p) => Math.min(totalPages, p + 1));
              }}
              disabled={page >= totalPages}
              className="px-4 py-1.5 rounded-full border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
