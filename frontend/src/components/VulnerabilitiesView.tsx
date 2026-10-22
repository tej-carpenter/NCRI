'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { fetchVulnerabilities } from '../lib/api';
import { Vulnerability } from '../types';

export const VulnerabilitiesView: React.FC = () => {
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');
  const [ransomwareOnly, setRansomwareOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchVulnerabilities(page, 15, search || undefined, ransomwareOnly);
      setVulnerabilities(data.items || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
    } catch (e) {
      console.error('Failed to load vulnerabilities:', e);
    } finally {
      setLoading(false);
    }
  }, [page, search, ransomwareOnly]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadData();
  };

  return (
    <div className="space-y-4">
      {/* Ribbon (Material Surface Card) */}
      <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-[#131826] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.2)]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <input
              type="text"
              placeholder="Search CVE ID, vendor (Microsoft, Apache, Cisco), product, or description..."
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

          <div className="flex items-center space-x-2 text-xs">
            <label className="flex items-center space-x-2 cursor-pointer bg-slate-50 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-full px-3.5 py-1.5 text-slate-700 dark:text-slate-300 font-medium">
              <input
                type="checkbox"
                checked={ransomwareOnly}
                onChange={(e) => { setRansomwareOnly(e.target.checked); setPage(1); }}
                className="rounded accent-blue-600"
              />
              <span>Ransomware Campaigns Only</span>
            </label>
          </div>
        </div>
      </div>

      {/* Table (Material Data Table) */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-[#131826] shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.2)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3.5">CVE ID</th>
                <th className="px-4 py-3.5">Vendor / Product</th>
                <th className="px-4 py-3.5">Vulnerability Title</th>
                <th className="px-4 py-3.5">Date Added</th>
                <th className="px-4 py-3.5">Ransomware Campaign</th>
                <th className="px-4 py-3.5">Required Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-4 py-3.5">
                      <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full" />
                    </td>
                  </tr>
                ))
              ) : vulnerabilities.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                    No exploited vulnerabilities matched your search criteria.
                  </td>
                </tr>
              ) : (
                vulnerabilities.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3.5 font-mono font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap">
                      {v.cve_id}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-slate-900 dark:text-slate-100 font-semibold">
                      {v.vendor_project} • {v.product}
                    </td>
                    <td className="px-4 py-3.5 max-w-sm truncate text-slate-600 dark:text-slate-300">
                      {v.vulnerability_name}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap font-mono text-slate-500 dark:text-slate-400 text-[11px]">
                      {v.date_added || '—'}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {v.known_ransomware_campaign_use === 'Known' ? (
                        <span className="rounded-full bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/60 px-2.5 py-0.5 text-xs font-bold">
                          Confirmed Weaponized
                        </span>
                      ) : (
                        <span className="rounded-full bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700 px-2.5 py-0.5 text-xs font-medium">
                          Unknown
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400 max-w-xs truncate text-[11px]">
                      {v.required_action || 'Apply vendor remediation patch.'}
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
            Showing {vulnerabilities.length} of <span className="font-semibold text-slate-900 dark:text-white">{total.toLocaleString()}</span> vulnerabilities
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
    </div>
  );
};
