import React, { useState, useEffect } from 'react';
import { Share2, Sliders, ShieldAlert, ArrowRight } from 'lucide-react';
import { CyberIncident } from '../types';
import { NCRIRepository } from '../services/repository';
import { calculateIncidentNCRI, SECTOR_CRITICALITY, ATTACK_EXPLOITATION } from '../services/ncri_calculator';
import { NativeService } from '../services/native';

interface MobileRiskEngineProps {
  countryScope: string;
  onInspectIncident: (inc: CyberIncident) => void;
}

export const MobileRiskEngine: React.FC<MobileRiskEngineProps> = ({
  countryScope,
  onInspectIncident,
}) => {
  const [incidents, setIncidents] = useState<CyberIncident[]>([]);
  const [loading, setLoading] = useState(true);

  // Interactive Incident Risk Calculator State
  const [simSector, setSimSector] = useState('Healthcare & Pharmaceuticals');
  const [simSeverity, setSimSeverity] = useState(8.5);
  const [simAttack, setSimAttack] = useState('Ransomware & Extortion');
  const [simActor, setSimActor] = useState('LockBit 3.0 / BlackCat Cartel');
  const [wSeverity, setWSeverity] = useState(0.35);
  const [wCriticality, setWCriticality] = useState(0.30);
  const [wExploitation, setWExploitation] = useState(0.20);
  const [wActor, setWActor] = useState(0.15);

  useEffect(() => {
    let active = true;
    const fetchIncidents = async () => {
      setLoading(true);
      try {
        const res = await NCRIRepository.getIncidents({
          page: 1,
          size: 50,
          country: countryScope !== 'All' ? countryScope : undefined,
        });
        if (active) {
          setIncidents(res.data.items || []);
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchIncidents();
    return () => {
      active = false;
    };
  }, [countryScope]);

  // Compute calculated incident simulation
  const simulatedNCRI = calculateIncidentNCRI(
    {
      sector: simSector,
      severity_score: simSeverity,
      attack_type: simAttack,
      threat_actor: simActor,
      impact_level: simSeverity >= 8.5 ? 'Critical' : 'High',
    },
    { severity: wSeverity, criticality: wCriticality, exploitation: wExploitation, actor: wActor }
  );

  // Rank loaded incidents by calculated incident NCRI score
  const rankedIncidents = [...incidents]
    .map((inc) => ({
      incident: inc,
      ncri: calculateIncidentNCRI(inc),
    }))
    .sort((a, b) => b.ncri.score - a.ncri.score);

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'Severe':
        return 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border-rose-300 dark:border-rose-800';
      case 'High':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-300 dark:border-amber-800';
      case 'Elevated':
        return 'bg-yellow-50 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400 border-yellow-300 dark:border-yellow-800';
      case 'Moderate':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border-blue-300 dark:border-blue-800';
      default:
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800';
    }
  };

  const handleShareSimulatedRisk = async () => {
    NativeService.hapticFeedback();
    const title = `NCRI Incident Risk Evaluation Report`;
    const text =
      `National Cyber Crime Risk Assessment Report:\n\n` +
      `• Assigned Incident NCRI Score: ${simulatedNCRI.score}/100 (${simulatedNCRI.tier} Risk Tier)\n` +
      `• Target Sector: ${simSector} (Criticality: ${simulatedNCRI.components.sectorCriticality}/100)\n` +
      `• Attack Vector: ${simAttack} (Exploitation: ${simulatedNCRI.components.attackExploitation}/100)\n` +
      `• Threat Actor Factor: ${simActor} (Impact: ${simulatedNCRI.components.actorImpact}/100)\n` +
      `• Severity Rating: ${simSeverity}/10 (${simulatedNCRI.components.severity}/100)\n` +
      `• Formula: NCRI = (w_s * S_i) + (w_c * C_sec) + (w_e * E_att) + (w_a * A_act)\n\n` +
      `Calculated by NCRI Platform: https://ncri.vercel.app`;

    await NativeService.shareContent({
      title,
      text,
      dialogTitle: 'Share Incident NCRI Risk Report',
    });
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Incident-Level Methodology Card */}
      <div className="rounded-2xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/60 dark:bg-blue-950/20 p-4 shadow-xs space-y-2 transition-colors duration-200">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">
            Incident-Level Risk Engine (NCRI v1.0.0)
          </span>
          <span className="text-xs px-2.5 py-0.5 rounded-full font-bold border bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-800">
            Per-Incident Assignment
          </span>
        </div>

        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
          The National Cyber Crime Risk Index (NCRI) is computed specifically for <strong>each verified cyber incident</strong> by quantifying severity score ($S_i$), infrastructure criticality ($C_s$), weaponized exploitation velocity ($E_s$), and threat actor impact factor ($A_i$).
        </p>

        <div className="bg-white/80 dark:bg-[#0b0f19]/80 p-2.5 rounded-xl border border-blue-200/60 dark:border-slate-800 font-mono text-[11px] text-blue-700 dark:text-blue-300">
          NCRI<sub>incident</sub> = (w<sub>s</sub> · S<sub>i</sub>) + (w<sub>c</sub> · C<sub>sector</sub>) + (w<sub>e</sub> · E<sub>attack</sub>) + (w<sub>a</sub> · A<sub>actor</sub>)
        </div>
      </div>

      {/* Interactive Incident Risk Simulator */}
      <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-[#131826] p-4 shadow-xs space-y-4 transition-colors duration-200">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
              Interactive Incident NCRI Simulator
            </h3>
          </div>
          <button
            onClick={handleShareSimulatedRisk}
            className="flex items-center space-x-1 px-3 py-1 rounded-full bg-blue-600 text-white text-[11px] font-semibold active:scale-95 transition shadow-xs"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share Assessment</span>
          </button>
        </div>

        {/* Calculated Output Display */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0b0f19] p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Simulated Incident NCRI Score
            </span>
            <div className="flex items-baseline space-x-1.5 mt-1">
              <span className="text-3xl font-black text-slate-900 dark:text-white font-mono">
                {simulatedNCRI.score.toFixed(1)}
              </span>
              <span className="text-xs text-slate-500 font-semibold">/ 100</span>
            </div>
          </div>

          <div className="text-right">
            <span className={`text-xs font-bold px-3 py-1 rounded-full border inline-block ${getTierBadge(simulatedNCRI.tier)}`}>
              {simulatedNCRI.tier} Risk Tier
            </span>
            <div className="mt-1.5 text-[10px] text-slate-500">
              Composite Assessment
            </div>
          </div>
        </div>

        {/* Inputs */}
        <div className="space-y-3 text-xs">
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
              Target Infrastructure Sector
            </label>
            <select
              value={simSector}
              onChange={(e) => setSimSector(e.target.value)}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/90 p-2 text-slate-900 dark:text-slate-100 focus:outline-none"
            >
              {Object.keys(SECTOR_CRITICALITY).map((sec) => (
                <option key={sec} value={sec}>
                  {sec} (Criticality: {SECTOR_CRITICALITY[sec]})
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex justify-between text-slate-700 dark:text-slate-300 mb-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">
                Incident Severity Score (0.0 – 10.0)
              </label>
              <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{simSeverity.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="10.0"
              step="0.5"
              value={simSeverity}
              onChange={(e) => setSimSeverity(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
              Attack Classification & Vector
            </label>
            <select
              value={simAttack}
              onChange={(e) => setSimAttack(e.target.value)}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/90 p-2 text-slate-900 dark:text-slate-100 focus:outline-none"
            >
              {Object.keys(ATTACK_EXPLOITATION).map((att) => (
                <option key={att} value={att}>
                  {att} (Factor: {ATTACK_EXPLOITATION[att]})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Top Highest Risk Cyber Incidents (Ranked by Assigned NCRI Score) */}
      <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-[#131826] p-4 shadow-xs space-y-3 transition-colors duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
              Highest Risk Incidents Ranked by NCRI Score
            </h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              Incidents exhibiting highest systemic disruption potential
            </p>
          </div>
          <span className="text-[10px] font-mono text-slate-500 font-semibold">
            {rankedIncidents.length} Evaluated
          </span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
          {rankedIncidents.slice(0, 8).map(({ incident: inc, ncri }) => (
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
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full border shrink-0 ${getTierBadge(
                      ncri.tier
                    )}`}
                  >
                    {ncri.tier}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-slate-500 dark:text-slate-400">
                  <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">
                    NCRI {ncri.score.toFixed(1)}
                  </span>
                  <span>•</span>
                  <span className="truncate max-w-[120px]">{inc.sector}</span>
                  {inc.country && (
                    <>
                      <span>•</span>
                      <span className="truncate max-w-[90px]">{inc.country}</span>
                    </>
                  )}
                  <span>•</span>
                  <span>{inc.incident_date}</span>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  NativeService.hapticFeedback();
                  onInspectIncident(inc);
                }}
                className="px-2.5 py-1 rounded-full border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-white hover:bg-blue-600 text-[10px] font-semibold transition shrink-0"
              >
                Inspect
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
