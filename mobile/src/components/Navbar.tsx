import React from 'react';
import { RefreshCw, Download, Moon, Sun, Shield } from 'lucide-react';
import { NativeService } from '../services/native';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
  systemStatus: string;
  onSync: () => void;
  syncing: boolean;
  onExportCsv: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isDark,
  setIsDark,
  systemStatus,
  onSync,
  syncing,
  onExportCsv,
}) => {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'incidents', label: 'Incident Explorer' },
    { id: 'trends', label: 'Trends & Prediction' },
    { id: 'sectors', label: 'Sector Analysis' },
    { id: 'risk', label: 'NCRI Risk Engine' },
    { id: 'sources', label: 'Data Sources & Runs' },
  ];

  const handleTabClick = (tabId: string) => {
    NativeService.hapticFeedback();
    setActiveTab(tabId);
  };

  const handleThemeToggle = (dark: boolean) => {
    NativeService.hapticFeedback();
    setIsDark(dark);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#0b0f19]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 pt-[calc(env(safe-area-inset-top,0px)+0.5rem)] pb-2 px-3 sm:px-4 shadow-sm transition-colors duration-200">
      {/* Top Bar matching Web Platform Screenshots */}
      <div className="flex items-center justify-between gap-2">
        {/* Brand */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-sm shadow-sm">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-sm sm:text-base tracking-tight text-blue-600 dark:text-blue-400">
                NCRI
              </span>
              <span className="font-bold text-sm sm:text-base tracking-tight text-slate-900 dark:text-white">
                Platform
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded border border-blue-500/30 text-blue-600 dark:text-blue-400 bg-blue-500/10">
                v1.0.0
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 hidden xs:block truncate max-w-[200px]">
              National Cyber Incident Analytics Platform
            </p>
          </div>
        </div>

        {/* Top Controls: Status, Sync, Export, Theme Toggle */}
        <div className="flex items-center space-x-1.5">
          {/* Status Badge */}
          <div className="hidden sm:flex items-center space-x-1 px-2.5 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>{systemStatus === 'healthy' ? 'System Operational' : 'Degraded'}</span>
          </div>

          {/* Sync Sources Button */}
          <button
            onClick={() => {
              NativeService.hapticFeedback();
              onSync();
            }}
            disabled={syncing}
            className="px-2.5 py-1 rounded-full border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition active:scale-95 flex items-center space-x-1"
          >
            <RefreshCw className={`w-3 h-3 ${syncing ? 'animate-spin text-blue-500' : ''}`} />
            <span className="hidden xs:inline">Sync</span>
          </button>

          {/* Export CSV Button */}
          <button
            onClick={() => {
              NativeService.hapticFeedback();
              onExportCsv();
            }}
            className="px-2.5 py-1 rounded-full bg-blue-600 text-white text-[11px] font-semibold hover:bg-blue-500 transition active:scale-95 flex items-center space-x-1 shadow-xs"
          >
            <Download className="w-3 h-3" />
            <span className="hidden xs:inline">Export CSV</span>
          </button>

          {/* Light / Dark Toggle Pill matching Web Screenshot */}
          <div className="flex items-center rounded-full border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 p-0.5 text-[11px]">
            <button
              onClick={() => handleThemeToggle(false)}
              className={`px-2 py-0.5 rounded-full font-semibold transition ${
                !isDark ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Light
            </button>
            <button
              onClick={() => handleThemeToggle(true)}
              className={`px-2 py-0.5 rounded-full font-semibold transition ${
                isDark ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Dark
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Scrollable Tabs matching Web Interface */}
      <nav className="mt-2.5 flex items-center space-x-1 overflow-x-auto no-scrollbar pb-0.5 border-t border-slate-200/70 dark:border-slate-800/70 pt-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-150 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>
    </header>
  );
};
