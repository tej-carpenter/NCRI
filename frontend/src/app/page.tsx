'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  fetchHealth,
  fetchKpis,
  fetchTrends,
  fetchSectors,
  fetchIncidents,
  triggerSourceSync,
} from '../lib/api';
import { SummaryKPIs, TrendPoint, SectorStat, CyberIncident } from '../types';
import { Navbar } from '../components/Navbar';
import { DashboardOverview } from '../components/DashboardOverview';
import { IncidentExplorer } from '../components/IncidentExplorer';
import { TrendsView } from '../components/TrendsView';
import { SectorView } from '../components/SectorView';
import { GeoView } from '../components/GeoView';
import { RiskEngineView } from '../components/RiskEngineView';
import { VulnerabilitiesView } from '../components/VulnerabilitiesView';
import { SourcesView } from '../components/SourcesView';

export default function Home() {
  const [activeTab, setActiveTab] = useState('overview');
  const [systemStatus, setSystemStatus] = useState('checking');
  const [syncing, setSyncing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Global filters
  const [countryScope, setCountryScope] = useState('All');

  // Shared Data
  const [kpis, setKpis] = useState<SummaryKPIs | null>(null);
  const [trends, setTrends] = useState<TrendPoint[]>([]);
  const [sectors, setSectors] = useState<SectorStat[]>([]);
  const [recentIncidents, setRecentIncidents] = useState<CyberIncident[]>([]);

  const loadGlobalData = useCallback(async () => {
    setLoading(true);
    try {
      try {
        const h = await fetchHealth();
        setSystemStatus(h.status || 'healthy');
      } catch {
        setSystemStatus('degraded');
      }

      const [kpiRes, trendRes, secRes, incRes] = await Promise.allSettled([
        fetchKpis(countryScope),
        fetchTrends(countryScope),
        fetchSectors(countryScope),
        fetchIncidents({ page: 1, size: 8, country: countryScope !== 'All' ? countryScope : undefined }),
      ]);

      if (kpiRes.status === 'fulfilled') {
        setKpis(kpiRes.value);
      } else {
        console.error('Failed to load KPIs:', kpiRes.reason);
      }

      if (trendRes.status === 'fulfilled') {
        setTrends(trendRes.value || []);
      } else {
        console.error('Failed to load Trends:', trendRes.reason);
      }

      if (secRes.status === 'fulfilled') {
        setSectors(secRes.value || []);
      } else {
        console.error('Failed to load Sectors:', secRes.reason);
      }

      if (incRes.status === 'fulfilled') {
        setRecentIncidents(incRes.value.items || []);
      } else {
        console.error('Failed to load Recent Incidents:', incRes.reason);
      }
    } catch (err) {
      console.error('Error loading platform data:', err);
    } finally {
      setLoading(false);
    }
  }, [countryScope]);

  useEffect(() => {
    loadGlobalData();
  }, [loadGlobalData]);

  const handleQuickSync = async () => {
    setSyncing(true);
    try {
      await triggerSourceSync('ransomware_live', 200);
      await loadGlobalData();
    } catch (err) {
      console.error('Quick sync failed:', err);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        systemStatus={systemStatus}
        onQuickSync={handleQuickSync}
        syncing={syncing}
      />

      {/* Main Container */}
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 py-6">
        {activeTab === 'overview' && (
          <DashboardOverview
            kpis={kpis}
            trends={trends}
            sectors={sectors}
            recentIncidents={recentIncidents}
            loading={loading}
            onNavigateTab={setActiveTab}
            countryScope={countryScope}
            setCountryScope={setCountryScope}
          />
        )}

        {activeTab === 'incidents' && <IncidentExplorer />}

        {activeTab === 'trends' && <TrendsView />}

        {activeTab === 'sectors' && <SectorView />}

        {activeTab === 'geography' && <GeoView />}

        {activeTab === 'risk' && <RiskEngineView />}

        {activeTab === 'vulnerabilities' && <VulnerabilitiesView />}

        {activeTab === 'sources' && <SourcesView />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-[#0f1422]/80 py-4 px-4 text-center text-xs text-slate-500 dark:text-slate-400 transition-colors duration-200">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            National Cyber Incident Analytics Platform (NCRI)
          </span>
          <div className="flex items-center space-x-4">
            <span className="font-mono text-[11px] text-slate-400 dark:text-slate-500">NCRI v1.0.0</span>
            <a
              href="/docs"
              target="_blank"
              className="text-blue-600 dark:text-blue-400 hover:underline transition"
            >
              API Docs (FastAPI)
            </a>
            <a
              href="/api/health"
              target="_blank"
              className="text-blue-600 dark:text-blue-400 hover:underline transition"
            >
              System Health
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
