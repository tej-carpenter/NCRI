'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { fetchIncidents, fetchIncidentDetail, getCsvExportUrl } from '../lib/api';
import { CyberIncident } from '../types';

export const IncidentExplorer: React.FC = () => {
  const [incidents, setIncidents] = useState<CyberIncident[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [sector, setSector] = useState('All');
  const [country, setCountry] = useState('All');
  const [attackType, setAttackType] = useState('All');
  const [severity, setSeverity] = useState('All');
  const [year, setYear] = useState<number | undefined>(undefined);
  const [sortBy, setSortBy] = useState('incident_date');
  const [sortDir, setSortDir] = useState('desc');

  // Selected incident modal
  const [selectedIncident, setSelectedIncident] = useState<CyberIncident | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchIncidents({
        page,
        size: 15,
        search: search || undefined,
        sector: sector !== 'All' ? sector : undefined,
        country: country !== 'All' ? country : undefined,
        attack_type: attackType !== 'All' ? attackType : undefined,
        severity: severity !== 'All' ? severity : undefined,
        year: year,
        sort_by: sortBy,
        sort_dir: sortDir,
      });
      setIncidents(data.items || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
    } catch (err) {
      console.error('Failed to load incidents:', err);
    } finally {
      setLoading(false);
    }
  }, [page, search, sector, country, attackType, severity, year, sortBy, sortDir]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadData();
  };

  const handleOpenDetail = async (id: number) => {
    try {
      const detail = await fetchIncidentDetail(id);
      setSelectedIncident(detail);
    } catch (err) {
      console.error('Failed to load incident detail:', err);
    }
  };

  const severityBadge = (sev: string) => {
    switch (sev) {
      case 'Critical':
        return (
          <span className="rounded-full bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/60 px-2.5 py-0.5 text-xs font-semibold">
            Critical
          </span>
        );
      case 'High':
        return (
          <span className="rounded-full bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/60 px-2.5 py-0.5 text-xs font-semibold">
            High
          </span>
        );
      case 'Medium':
        return (
          <span className="rounded-full bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/60 px-2.5 py-0.5 text-xs font-semibold">
            Medium
          </span>
        );
      default:
        return (
          <span className="rounded-full bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 px-2.5 py-0.5 text-xs font-semibold">
            Low
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Filter Bar (Material Card) */}
      <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-[#131826] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.2)]">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <input
              type="text"
              placeholder="Search victim organization, threat actor, or keywords..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-full border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/90 pl-4 pr-24 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1.5 rounded-full bg-blue-600 px-3.5 py-1 text-xs font-semibold text-white hover:bg-blue-700 transition-colors shadow-xs"
            >
              Search
            </button>
          </form>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Sector */}
            <select
              value={sector}
              onChange={(e) => { setSector(e.target.value); setPage(1); }}
              className="rounded-full border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/90 px-3 py-1.5 text-slate-700 dark:text-slate-200 focus:border-blue-500 focus:outline-none"
            >
              <option value="All">All Sectors</option>
              <option value="Healthcare & Pharmaceuticals">Healthcare</option>
              <option value="Financial Services & Banking">Finance & Banking</option>
              <option value="Energy & Critical Utilities">Energy & Utilities</option>
              <option value="Government & Defense">Government & Defense</option>
              <option value="Information Technology & Telecom">IT & Telecom</option>
              <option value="Manufacturing & Industrial">Manufacturing</option>
              <option value="Education & Research">Education & Research</option>
              <option value="Transportation & Logistics">Transportation</option>
              <option value="Commercial & Retail">Commercial</option>
            </select>

            {/* Country */}
            <select
              value={country}
              onChange={(e) => { setCountry(e.target.value); setPage(1); }}
              className="rounded-full border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/90 px-3 py-1.5 text-slate-700 dark:text-slate-200 focus:border-blue-500 focus:outline-none"
            >
              <option value="All">All Countries</option>
              <option value="India">India (National)</option>
              <option value="United States">United States</option>
              <option value="Germany">Germany</option>
              <option value="United Kingdom">United Kingdom</option>
              <option value="Brazil">Brazil</option>
              <option value="Russian Federation">Russia</option>
            </select>

            {/* Attack Type */}
            <select
              value={attackType}
              onChange={(e) => { setAttackType(e.target.value); setPage(1); }}
              className="rounded-full border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/90 px-3 py-1.5 text-slate-700 dark:text-slate-200 focus:border-blue-500 focus:outline-none"
            >
              <option value="All">All Attack Types</option>
              <option value="Ransomware & Extortion">Ransomware</option>
              <option value="Data Breach & Exfiltration">Data Breach</option>
              <option value="Distributed Denial of Service (DDoS)">DDoS</option>
              <option value="Vulnerability Exploitation">Vulnerability Exploitation</option>
              <option value="Malware & Espionage">Malware / Espionage</option>
              <option value="Supply Chain Attack">Supply Chain</option>
            </select>

            {/* Severity */}
            <select
              value={severity}
              onChange={(e) => { setSeverity(e.target.value); setPage(1); }}
              className="rounded-full border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/90 px-3 py-1.5 text-slate-700 dark:text-slate-200 focus:border-blue-500 focus:outline-none"
            >
              <option value="All">All Severities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            {/* Year Filter */}
            <select
              value={year || 'All'}
              onChange={(e) => { setYear(e.target.value === 'All' ? undefined : parseInt(e.target.value)); setPage(1); }}
              className="rounded-full border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/90 px-3 py-1.5 text-slate-700 dark:text-slate-200 focus:border-blue-500 focus:outline-none"
            >
              <option value="All">All Years</option>
              <option value="2026">2026</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
              <option value="2021">2021</option>
            </select>

            {/* Sort Filter */}
            <select
              value={`${sortBy}:${sortDir}`}
              onChange={(e) => {
                const [sb, sd] = e.target.value.split(':');
                setSortBy(sb);
                setSortDir(sd);
                setPage(1);
              }}
              className="rounded-full border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/90 px-3 py-1.5 text-slate-700 dark:text-slate-200 focus:border-blue-500 focus:outline-none"
            >
              <option value="incident_date:desc">Newest Date</option>
              <option value="incident_date:asc">Oldest Date</option>
              <option value="severity_score:desc">Highest Severity</option>
              <option value="victim_name:asc">Victim A-Z</option>
            </select>

            {/* Export URL */}
            <a
              href={getCsvExportUrl({ sector, country, attack_type: attackType, severity, year })}
              download
              className="rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 font-semibold transition-colors"
              title="Export currently filtered dataset"
            >
              Export CSV
            </a>
          </div>
        </div>
      </div>

      {/* Incidents Table (Material Data Table) */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-[#131826] shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.2)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3.5">Date</th>
                <th className="px-4 py-3.5">Victim Organization</th>
                <th className="px-4 py-3.5">Sector</th>
                <th className="px-4 py-3.5">Country</th>
                <th className="px-4 py-3.5">Attack Type</th>
                <th className="px-4 py-3.5">Threat Actor</th>
                <th className="px-4 py-3.5">Severity</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={8} className="px-4 py-3.5">
                      <div className="h-4 w-full bg-slate-100 dark:bg-slate-800/60 rounded-full" />
                    </td>
                  </tr>
                ))
              ) : incidents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                    No cyber incidents match the selected filter criteria.
                  </td>
                </tr>
              ) : (
                incidents.map((inc) => (
                  <tr
                    key={inc.id}
                    onClick={() => handleOpenDetail(inc.id)}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-3.5 whitespace-nowrap text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                      {inc.incident_date}
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-slate-900 dark:text-white max-w-xs truncate">
                      {inc.victim_name || 'Target Entity'}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-slate-600 dark:text-slate-300">
                      {inc.sector}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-slate-600 dark:text-slate-300">
                      {inc.country || 'Unknown'}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-medium text-[11px]">
                        {inc.attack_type}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-slate-500 dark:text-slate-400 max-w-[120px] truncate">
                      {inc.threat_actor || '—'}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {severityBadge(inc.severity)}
                    </td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleOpenDetail(inc.id); }}
                        className="rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1 text-[11px] font-semibold text-slate-700 dark:text-slate-200 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 px-4 py-3 text-xs text-slate-500 dark:text-slate-400">
          <div>
            Showing {incidents.length} of <span className="font-semibold text-slate-900 dark:text-white">{total.toLocaleString()}</span> incidents
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1 font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 transition-colors"
            >
              Previous
            </button>
            <span>
              Page <span className="font-semibold text-slate-900 dark:text-white">{page}</span> of {pages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
              disabled={page >= pages}
              className="rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1 font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Incident Detail Modal */}
      {selectedIncident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131826] p-6 shadow-2xl text-slate-700 dark:text-slate-300">
            <button
              onClick={() => setSelectedIncident(null)}
              className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Close
            </button>

            <div className="flex flex-wrap items-center gap-2 mb-2">
              {severityBadge(selectedIncident.severity)}
              <span className="rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-0.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
                Score: {selectedIncident.severity_score} / 10.0
              </span>
              <span className="rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-0.5 text-xs text-slate-700 dark:text-slate-300 font-mono">
                {selectedIncident.incident_ref}
              </span>
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              {selectedIncident.victim_name || 'Cyber Incident'}
            </h3>
            <p className="text-xs text-blue-600 dark:text-blue-400 mb-4 font-medium">
              {selectedIncident.title || `${selectedIncident.attack_type} Event`}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 p-3.5 border border-slate-200 dark:border-slate-800 text-xs">
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-semibold">Incident Date</span>
                <span className="text-slate-900 dark:text-white font-mono">{selectedIncident.incident_date}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-semibold">Sector</span>
                <span className="text-slate-900 dark:text-white">{selectedIncident.sector}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-semibold">Country</span>
                <span className="text-slate-900 dark:text-white">{selectedIncident.country} ({selectedIncident.country_code || '—'})</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-semibold">Attack Vector</span>
                <span className="text-slate-900 dark:text-white">{selectedIncident.attack_type}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-semibold">Threat Actor</span>
                <span className="text-slate-900 dark:text-white">{selectedIncident.threat_actor || 'Unattributed'}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-semibold">Provenance Source</span>
                <span className="text-slate-900 dark:text-white">{selectedIncident.source_name || 'System Feed'}</span>
              </div>
            </div>

            {/* Description */}
            <div className="mb-4">
              <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Incident Description & Context
              </h4>
              <div className="rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-3 text-xs text-slate-700 dark:text-slate-300 leading-relaxed max-h-48 overflow-y-auto">
                {selectedIncident.description || 'No detailed narrative provided for this record.'}
              </div>
            </div>

            {/* Correlated CVEs */}
            {selectedIncident.linked_vulnerabilities && selectedIncident.linked_vulnerabilities.length > 0 && (
              <div className="mb-4">
                <h4 className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1.5">
                  Correlated CISA KEV / NVD Exploited CVEs
                </h4>
                <div className="space-y-1.5">
                  {selectedIncident.linked_vulnerabilities.map((vuln, vIdx) => (
                    <div key={vIdx} className="flex items-center justify-between rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 px-3 py-2 text-xs">
                      <div>
                        <span className="font-mono font-bold text-blue-700 dark:text-blue-300">{vuln.cve_id}</span>
                        {vuln.vulnerability_name && (
                          <span className="ml-2 text-slate-500 dark:text-slate-400 text-[11px]">{vuln.vulnerability_name}</span>
                        )}
                      </div>
                      <span className="rounded-full bg-blue-100 dark:bg-blue-900/40 px-2 py-0.5 text-[10px] font-semibold text-blue-700 dark:text-blue-300">
                        {vuln.relationship_type} ({Math.round(vuln.confidence * 100)}% conf)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Source Reference Link */}
            {selectedIncident.source_url && (
              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-500">External Verification:</span>
                <a
                  href={selectedIncident.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium truncate max-w-xs"
                >
                  {selectedIncident.source_url}
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
