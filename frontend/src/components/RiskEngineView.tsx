'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { fetchRiskIndex, calculateCustomRisk } from '../lib/api';
import { NCRIOverviewResponse } from '../types';

export const RiskEngineView: React.FC = () => {
  const [riskData, setRiskData] = useState<NCRIOverviewResponse | null>(null);
  const [country, setCountry] = useState('All');
  const [period, setPeriod] = useState('All-Time');
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);

  // Weight simulator sliders
  const [wFrequency, setWFrequency] = useState(0.35);
  const [wSeverity, setWSeverity] = useState(0.30);
  const [wCriticality, setWCriticality] = useState(0.20);
  const [wExploitation, setWExploitation] = useState(0.15);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchRiskIndex(period, country);
      setRiskData(data);
    } catch (e) {
      console.error('Failed to load NCRI data:', e);
    } finally {
      setLoading(false);
    }
  }, [country, period]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRecalculate = async () => {
    setCalculating(true);
    try {
      const data = await calculateCustomRisk({
        assessment_period: period,
        country: country,
        weight_frequency: wFrequency,
        weight_severity: wSeverity,
        weight_criticality: wCriticality,
        weight_exploitation: wExploitation,
      });
      setRiskData(data);
    } catch (e) {
      console.error('Failed to calculate custom risk:', e);
    } finally {
      setCalculating(false);
    }
  };

  const resetWeights = () => {
    setWFrequency(0.35);
    setWSeverity(0.30);
    setWCriticality(0.20);
    setWExploitation(0.15);
  };

  const riskTierBadge = (tier: string) => {
    switch (tier) {
      case 'Severe':
        return (
          <span className="rounded-full bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/60 px-2.5 py-0.5 text-xs font-bold">
            Severe
          </span>
        );
      case 'High':
        return (
          <span className="rounded-full bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/60 px-2.5 py-0.5 text-xs font-bold">
            High
          </span>
        );
      case 'Elevated':
        return (
          <span className="rounded-full bg-yellow-50 text-yellow-700 border border-yellow-200 dark:bg-yellow-950/40 dark:text-yellow-300 dark:border-yellow-900/60 px-2.5 py-0.5 text-xs font-bold">
            Elevated
          </span>
        );
      case 'Moderate':
        return (
          <span className="rounded-full bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/60 px-2.5 py-0.5 text-xs font-bold">
            Moderate
          </span>
        );
      default:
        return (
          <span className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/60 px-2.5 py-0.5 text-xs font-bold">
            Low
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner (Material Surface Card) */}
      <div className="rounded-2xl border border-blue-200 dark:border-blue-800/60 bg-blue-50/60 dark:bg-blue-950/20 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.2)]">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="rounded-full bg-blue-100 dark:bg-blue-900/60 px-2.5 py-0.5 text-xs font-bold text-blue-700 dark:text-blue-300 font-mono">
                NCRI Methodology {riskData?.methodology_version || 'v1.0.0 (Provisional)'}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">Explainable Multi-Factor Scoring Engine</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
              National Cyber Risk Index (NCRI) Assessment Framework
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Computes normalized sectoral risk across observed empirical frequency, attack severity, critical infrastructure dependence, and weaponized exploit velocity.
            </p>
          </div>

          <div className="flex items-center space-x-5 bg-white dark:bg-[#131826] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div>
              <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-semibold">Overall Index</span>
              <span className="text-2xl font-black font-mono text-blue-600 dark:text-blue-400">
                {riskData?.overall_national_ncri || '—'} / 100
              </span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-semibold">National Tier</span>
              <div className="mt-0.5">
                {riskData && riskTierBadge(riskData.overall_risk_tier)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scope Selector Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-[#131826] p-3.5 shadow-xs text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-semibold text-slate-700 dark:text-slate-300">Assessment Scope:</span>
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="rounded-full border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/90 px-3 py-1.5 text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500 font-medium"
          >
            <option value="All">Global Assessment</option>
            <option value="India">India (National Cyber Risk Profile)</option>
            <option value="United States">United States</option>
            <option value="Germany">Germany</option>
            <option value="United Kingdom">United Kingdom</option>
          </select>

          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="rounded-full border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/90 px-3 py-1.5 text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500 font-medium"
          >
            <option value="All-Time">Cumulative (All Historical Data)</option>
            <option value="2026">2026 (Active Threats)</option>
            <option value="2023">2023 (Annual Baseline)</option>
            <option value="2022">2022</option>
          </select>
        </div>

        <div className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">
          Formula: <span className="text-blue-600 dark:text-blue-400 font-bold">NCRI = (wf·F) + (ws·S) + (wc·C) + (we·E)</span>
        </div>
      </div>

      {/* Main Grid: Sector Risk Rankings + Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sector Risk Rankings Table (2 cols) */}
        <div className="lg:col-span-2 overflow-hidden rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-[#131826] shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.2)]">
          <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Sectoral NCRI Scores & Multi-Factor Decomposition
            </h4>
            <span className="text-xs text-slate-500 dark:text-slate-400">Scale: 0.0 – 100.0</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Rank / Sector</th>
                  <th className="px-4 py-3">NCRI Score</th>
                  <th className="px-4 py-3">Risk Tier</th>
                  <th className="px-3 py-3 text-center" title="Incident Frequency Score">F (Freq)</th>
                  <th className="px-3 py-3 text-center" title="Attack Severity Score">S (Sev)</th>
                  <th className="px-3 py-3 text-center" title="Sector Criticality Weight">C (Crit)</th>
                  <th className="px-3 py-3 text-center" title="Exploitation/Ransomware Velocity">E (Exploit)</th>
                  <th className="px-4 py-3 text-right">Incidents</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {loading ? (
                  [...Array(6)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={8} className="px-4 py-3">
                        <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full" />
                      </td>
                    </tr>
                  ))
                ) : (
                  riskData?.sector_scores.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-100">
                        <span className="text-slate-400 font-mono mr-2">#{idx + 1}</span>
                        {item.sector}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">{item.ncri_score}</span>
                          <div className="h-1.5 w-16 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                item.ncri_score >= 85 ? 'bg-rose-500' :
                                item.ncri_score >= 70 ? 'bg-amber-500' :
                                item.ncri_score >= 50 ? 'bg-blue-500' : 'bg-emerald-500'
                              }`}
                              style={{ width: `${item.ncri_score}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">{riskTierBadge(item.risk_tier)}</td>
                      <td className="px-3 py-3 text-center font-mono text-slate-600 dark:text-slate-300">{item.frequency_score}</td>
                      <td className="px-3 py-3 text-center font-mono text-slate-600 dark:text-slate-300">{item.severity_score}</td>
                      <td className="px-3 py-3 text-center font-mono text-slate-600 dark:text-slate-300">{item.criticality_score}</td>
                      <td className="px-3 py-3 text-center font-mono text-slate-600 dark:text-slate-300">{item.exploitation_score}</td>
                      <td className="px-4 py-3 text-right font-mono text-blue-600 dark:text-blue-400 font-bold">
                        {item.incident_count.toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Interactive Weight Simulator & Sensitivity Tuning (1 col) */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-[#131826] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.2)]">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Weight Simulation Engine
              </h4>
              <button
                onClick={resetWeights}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold"
              >
                Reset Default
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Tune sensitivity parameters to evaluate sectoral exposure under varying operational doctrines.
            </p>

            <div className="space-y-4 text-xs">
              {/* Frequency weight */}
              <div>
                <div className="flex justify-between text-slate-700 dark:text-slate-300 mb-1 font-medium">
                  <span>wf: Incident Volume ({Math.round(wFrequency * 100)}%)</span>
                  <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">{wFrequency.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={wFrequency}
                  onChange={(e) => setWFrequency(parseFloat(e.target.value))}
                  className="w-full accent-blue-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full"
                />
              </div>

              {/* Severity weight */}
              <div>
                <div className="flex justify-between text-slate-700 dark:text-slate-300 mb-1 font-medium">
                  <span>ws: Attack Severity ({Math.round(wSeverity * 100)}%)</span>
                  <span className="font-mono text-sky-600 dark:text-sky-400 font-bold">{wSeverity.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={wSeverity}
                  onChange={(e) => setWSeverity(parseFloat(e.target.value))}
                  className="w-full accent-sky-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full"
                />
              </div>

              {/* Criticality weight */}
              <div>
                <div className="flex justify-between text-slate-700 dark:text-slate-300 mb-1 font-medium">
                  <span>wc: Infrastructure Criticality ({Math.round(wCriticality * 100)}%)</span>
                  <span className="font-mono text-amber-600 dark:text-amber-400 font-bold">{wCriticality.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={wCriticality}
                  onChange={(e) => setWCriticality(parseFloat(e.target.value))}
                  className="w-full accent-amber-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full"
                />
              </div>

              {/* Exploitation weight */}
              <div>
                <div className="flex justify-between text-slate-700 dark:text-slate-300 mb-1 font-medium">
                  <span>we: Weaponization Velocity ({Math.round(wExploitation * 100)}%)</span>
                  <span className="font-mono text-purple-600 dark:text-purple-400 font-bold">{wExploitation.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={wExploitation}
                  onChange={(e) => setWExploitation(parseFloat(e.target.value))}
                  className="w-full accent-purple-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full"
                />
              </div>

              <div className="pt-2">
                <button
                  onClick={handleRecalculate}
                  disabled={calculating}
                  className="w-full rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 shadow-sm transition-all disabled:opacity-50 text-xs"
                >
                  {calculating ? 'Recalculating...' : 'Recalculate NCRI Index'}
                </button>
              </div>
            </div>
          </div>

          {/* Methodology & Limitations Box */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131826] p-4 text-xs text-slate-500 dark:text-slate-400 space-y-2 shadow-xs">
            <div className="font-bold text-slate-800 dark:text-slate-200">
              Scientific Documentation & Disclaimers
            </div>
            <p className="text-[11px] leading-relaxed">
              • The NCRI represents relative comparative sector risk based on verified empirical disclosures.
            </p>
            <p className="text-[11px] leading-relaxed">
              • Missing financial loss figures in public bulletins are preserved as null rather than simulated.
            </p>
            <p className="text-[11px] leading-relaxed">
              • Methodological version is locked at <strong>v1.0.0 (Provisional)</strong> for academic reproducibility.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
