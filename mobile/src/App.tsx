import React, { useState, useEffect, useCallback } from 'react';
import { App as CapApp } from '@capacitor/app';
import { SummaryKPIs, CyberIncident, TrendPoint, SectorStat } from './types';
import { NCRIRepository } from './services/repository';
import { NativeService } from './services/native';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { OfflineBanner } from './components/OfflineBanner';
import { IncidentInspectModal } from './components/IncidentInspectModal';
import { MobileOverview } from './views/MobileOverview';
import { MobileIncidents } from './views/MobileIncidents';
import { MobileTrends } from './views/MobileTrends';
import { MobileSectors } from './views/MobileSectors';
import { MobileRiskEngine } from './views/MobileRiskEngine';
import { MobileSources } from './views/MobileSources';

export function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [countryScope, setCountryScope] = useState('All');
  const [isDark, setIsDark] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [systemStatus, setSystemStatus] = useState('healthy');

  // Intelligence Data
  const [kpis, setKpis] = useState<SummaryKPIs | null>(null);
  const [trends, setTrends] = useState<TrendPoint[]>([]);
  const [sectors, setSectors] = useState<SectorStat[]>([]);
  const [recentIncidents, setRecentIncidents] = useState<CyberIncident[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<CyberIncident | null>(null);

  // Sync dark mode class with HTML document
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Initial Boot & Native Listeners
  useEffect(() => {
    NCRIRepository.init();

    // Check Network
    NativeService.getNetworkStatus().then((status) => {
      setIsOnline(status.connected);
    });

    const netListener = NativeService.addNetworkListener((status) => {
      setIsOnline(status.connected);
    });

    // Android Hardware Back Button
    const backListener = CapApp.addListener('backButton', () => {
      if (selectedIncident) {
        setSelectedIncident(null);
      } else if (activeTab !== 'dashboard') {
        setActiveTab('dashboard');
      } else {
        CapApp.exitApp();
      }
    });

    return () => {
      Promise.resolve(netListener).then((l: any) => l?.remove?.());
      Promise.resolve(backListener).then((l: any) => l?.remove?.());
    };
  }, [selectedIncident, activeTab]);

  const loadData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const [healthRes, kpiRes, trendRes, secRes, incRes] = await Promise.allSettled([
        NCRIRepository.getHealth(),
        NCRIRepository.getKPIs(countryScope),
        NCRIRepository.getTrends(countryScope),
        NCRIRepository.getSectors(countryScope),
        NCRIRepository.getIncidents({ page: 1, size: 8, country: countryScope !== 'All' ? countryScope : undefined }),
      ]);

      if (healthRes.status === 'fulfilled') {
        setSystemStatus(healthRes.value.status || 'healthy');
      }
      if (kpiRes.status === 'fulfilled') {
        setKpis(kpiRes.value.data);
      }
      if (trendRes.status === 'fulfilled') {
        setTrends(trendRes.value.data || []);
      }
      if (secRes.status === 'fulfilled') {
        setSectors(secRes.value.data || []);
      }
      if (incRes.status === 'fulfilled') {
        setRecentIncidents(incRes.value.data.items || []);
      }
    } catch (err) {
      console.warn('Error loading NCRI metrics:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, [countryScope]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleQuickSync = async () => {
    setSyncing(true);
    try {
      await NCRIRepository.triggerSourceSync('ransomware_live', 100);
      await loadData();
      NativeService.hapticSuccess();
    } finally {
      setSyncing(false);
    }
  };

  const handleExportCsv = async () => {
    const backend = NCRIRepository.getBackendUrl();
    const exportUrl = `${backend}/api/reports/export-csv`;
    await NativeService.shareContent({
      title: 'NCRI Cyber Incident Telemetry Export (CSV)',
      text: `Download verified incident dataset export from NCRI Platform:\n${exportUrl}`,
      url: exportUrl,
      dialogTitle: 'Export Incident Dataset',
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Navigation Bar matching Web Screenshots */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isDark={isDark}
        setIsDark={setIsDark}
        systemStatus={systemStatus}
        onSync={handleQuickSync}
        syncing={syncing}
        onExportCsv={handleExportCsv}
      />

      {/* Ambient Offline Banner */}
      <OfflineBanner isOnline={isOnline} />

      {/* Main View Container */}
      <main className="flex-1 px-3 sm:px-6 py-4 max-w-7xl mx-auto w-full overflow-x-hidden">
        {activeTab === 'dashboard' && (
          <MobileOverview
            kpis={kpis}
            trends={trends}
            sectors={sectors}
            recentIncidents={recentIncidents}
            loading={isRefreshing}
            onNavigateTab={setActiveTab}
            countryScope={countryScope}
            setCountryScope={setCountryScope}
            onRefresh={loadData}
            onInspectIncident={setSelectedIncident}
            isDark={isDark}
          />
        )}

        {activeTab === 'incidents' && (
          <MobileIncidents
            countryScope={countryScope}
            onInspectIncident={setSelectedIncident}
            onExportCsv={handleExportCsv}
          />
        )}

        {activeTab === 'trends' && (
          <MobileTrends countryScope={countryScope} isDark={isDark} />
        )}

        {activeTab === 'sectors' && (
          <MobileSectors countryScope={countryScope} isDark={isDark} />
        )}

        {activeTab === 'risk' && (
          <MobileRiskEngine
            countryScope={countryScope}
            onInspectIncident={setSelectedIncident}
          />
        )}

        {activeTab === 'sources' && <MobileSources onRefreshAll={loadData} />}
      </main>

      {/* Footer matching Web Platform Screenshots */}
      <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0f1422] py-4 px-4 text-center text-xs text-slate-500 dark:text-slate-400 mb-12">
        <div className="max-w-md mx-auto space-y-2">
          <p className="font-semibold text-slate-700 dark:text-slate-300">
            National Cyber Incident Analytics Platform (NCRI)
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 text-[11px]">
            <span className="font-mono text-slate-400">v1.0.0</span>
            <span>•</span>
            <a
              href="https://ncri.onrender.com/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              API Docs (FastAPI)
            </a>
            <span>•</span>
            <a
              href="https://ncri.onrender.com/api/health"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              System Health
            </a>
            <span>•</span>
            <a
              href="https://github.com/tej-carpenter/NCRI"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-600 dark:text-slate-300 hover:text-black dark:hover:text-white"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>

      {/* Fixed Bottom Navigation */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Inspect Detail Modal */}
      <IncidentInspectModal
        incident={selectedIncident}
        onClose={() => setSelectedIncident(null)}
      />
    </div>
  );
}

export default App;
