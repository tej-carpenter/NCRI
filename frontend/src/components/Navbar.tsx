'use client';

import React, { useState, useEffect } from 'react';
import { API_BASE } from '../lib/api';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  systemStatus: string;
  onQuickSync: () => void;
  syncing: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  systemStatus,
  onQuickSync,
  syncing,
}) => {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    // Check initial theme from html class or localStorage
    const isDarkClass = document.documentElement.classList.contains('dark');
    setIsDark(isDarkClass);
  }, []);

  const handleSetTheme = (theme: 'light' | 'dark') => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('ncri-theme', 'dark');
      setIsDark(true);
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('ncri-theme', 'light');
      setIsDark(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Dashboard' },
    { id: 'incidents', label: 'Incident Explorer' },
    { id: 'trends', label: 'Trends & Prediction' },
    { id: 'sectors', label: 'Sector Analysis' },
    { id: 'geography', label: 'Geography' },
    { id: 'risk', label: 'NCRI Risk Engine' },
    { id: 'vulnerabilities', label: 'CISA KEV Intel' },
    { id: 'sources', label: 'Data Sources & Runs' },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/90 dark:border-slate-800/90 bg-white/95 dark:bg-[#0f1422]/95 backdrop-blur-md transition-colors duration-200">
      {/* Top App Bar */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand Typography */}
        <div
          className="flex items-center space-x-3 cursor-pointer select-none"
          onClick={() => setActiveTab('overview')}
        >
          <div className="flex items-baseline space-x-1.5">
            <span className="font-black text-xl tracking-tight text-blue-600 dark:text-blue-400">
              NCRI
            </span>
            <span className="font-semibold text-sm tracking-normal text-slate-800 dark:text-slate-100 hidden sm:inline">
              Platform
            </span>
          </div>

          <span className="rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/80 px-2 py-0.5 text-[10px] font-semibold text-blue-700 dark:text-blue-300">
            v1.0.0
          </span>

          <span className="hidden md:inline-block text-xs text-slate-500 dark:text-slate-400 border-l border-slate-200 dark:border-slate-800 pl-3 font-normal">
            National Cyber Incident Analytics Platform
          </span>
        </div>

        {/* Actions & Theme Toggle */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Status Indicator */}
          <div className="hidden lg:flex items-center space-x-2 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 px-3 py-1 text-xs">
            <span
              className={`h-2 w-2 rounded-full ${
                systemStatus === 'healthy' ? 'bg-emerald-500 dark:bg-emerald-400' : 'bg-amber-500'
              }`}
            />
            <span className="text-slate-600 dark:text-slate-300 font-medium">
              {systemStatus === 'healthy' ? 'System Operational' : 'Connecting...'}
            </span>
          </div>

          {/* Sync Button (Material Outlined) */}
          <button
            onClick={onQuickSync}
            disabled={syncing}
            className="rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/90 px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 hover:border-slate-400 dark:hover:border-slate-600 shadow-xs transition-all disabled:opacity-50"
          >
            {syncing ? 'Syncing...' : 'Sync Sources'}
          </button>

          {/* Export CSV (Material Filled) */}
          <a
            href={`${API_BASE}/reports/export-csv`}
            download="ncri_cyber_incidents.csv"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white px-3.5 py-1.5 text-xs font-semibold shadow-xs transition-all"
          >
            Export CSV
          </a>

          {/* Material Theme Toggle (Light / Dark segmented pill) */}
          <div className="flex items-center rounded-full border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/90 p-0.5 text-xs font-medium">
            <button
              type="button"
              onClick={() => handleSetTheme('light')}
              className={`rounded-full px-2.5 py-1 transition-all ${
                !isDark
                  ? 'bg-white text-slate-900 shadow-sm font-semibold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-200'
              }`}
            >
              Light
            </button>
            <button
              type="button"
              onClick={() => handleSetTheme('dark')}
              className={`rounded-full px-2.5 py-1 transition-all ${
                isDark
                  ? 'bg-blue-600 text-white shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Dark
            </button>
          </div>
        </div>
      </div>

      {/* Material 3 Tabs */}
      <nav className="border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/70 dark:bg-[#0d121e]/70 px-4 sm:px-6">
        <div className="mx-auto flex max-w-7xl space-x-1 overflow-x-auto scrollbar-none">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative whitespace-nowrap px-4 py-2.5 text-xs sm:text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/40 rounded-t-md'
                }`}
              >
                <span>{tab.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 inset-x-2 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </header>
  );
};
