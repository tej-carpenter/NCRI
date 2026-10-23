import React from 'react';
import { X, Share2, ExternalLink, ShieldAlert, Building2, Globe2, Calendar, User, Zap } from 'lucide-react';
import { CyberIncident } from '../types';
import { calculateIncidentNCRI } from '../services/ncri_calculator';
import { NativeService } from '../services/native';

interface IncidentInspectModalProps {
  incident: CyberIncident | null;
  onClose: () => void;
}

export const IncidentInspectModal: React.FC<IncidentInspectModalProps> = ({ incident, onClose }) => {
  if (!incident) return null;

  const ncri = calculateIncidentNCRI(incident);

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Severe':
        return 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-900/60';
      case 'High':
        return 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-900/60';
      case 'Elevated':
        return 'bg-yellow-50 dark:bg-yellow-950/40 text-yellow-700 dark:text-yellow-300 border-yellow-300 dark:border-yellow-900/60';
      case 'Moderate':
        return 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-900/60';
      default:
        return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-900/60';
    }
  };

  const handleShare = async () => {
    NativeService.hapticFeedback();
    const title = `NCRI Incident Risk Alert: ${incident.victim_name || incident.title || 'Target Entity'}`;
    const text =
      `National Cyber Crime Risk Assessment Report:\n\n` +
      `• Target Entity: ${incident.victim_name || 'Classified Entity'}\n` +
      `• Assigned Incident NCRI Score: ${ncri.score}/100 (${ncri.tier} Risk)\n` +
      `• Sector: ${incident.sector} (Criticality: ${ncri.components.sectorCriticality}/100)\n` +
      `• Attack Vector: ${incident.attack_type} (Exploitation: ${ncri.components.attackExploitation}/100)\n` +
      `• Threat Actor: ${incident.threat_actor || 'Unattributed'}\n` +
      `• Severity: ${incident.severity} (${ncri.components.severity}/100)\n` +
      `• Date: ${incident.incident_date}\n` +
      `• Country: ${incident.country || 'Global'}\n\n` +
      `Evaluated by National Cyber Incident Analytics Platform (NCRI).`;

    await NativeService.shareContent({
      title,
      text,
      url: incident.source_url,
      dialogTitle: 'Share Incident NCRI Risk Report',
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white dark:bg-[#131826] text-slate-900 dark:text-slate-100 w-full max-w-lg rounded-t-3xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 p-5 max-h-[88vh] overflow-y-auto space-y-4 shadow-2xl animate-in slide-in-from-bottom">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                {incident.incident_ref || `INC-${incident.id}`}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getTierColor(ncri.tier)}`}>
                {ncri.tier} Risk Tier
              </span>
            </div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
              {incident.victim_name || incident.title || 'Cyber Incident'}
            </h3>
          </div>
          <button
            onClick={() => {
              NativeService.hapticFeedback();
              onClose();
            }}
            className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Incident NCRI Score Banner */}
        <div className="rounded-2xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/70 dark:bg-blue-950/30 p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 block">
              Assigned Incident NCRI Score
            </span>
            <div className="flex items-baseline space-x-1.5 mt-1">
              <span className="text-3xl font-black text-blue-700 dark:text-blue-400 font-mono">
                {ncri.score.toFixed(1)}
              </span>
              <span className="text-xs text-slate-500 font-semibold">/ 100</span>
            </div>
            <span className="text-[10px] text-slate-600 dark:text-slate-400 block mt-0.5">
              Specific risk index computed for this incident event
            </span>
          </div>

          <div className="text-right">
            <span className={`text-xs font-bold px-3 py-1 rounded-full border inline-block ${getTierColor(ncri.tier)}`}>
              {ncri.tier} Risk
            </span>
            <div className="mt-2 text-[10px] text-slate-500 font-mono">
              Severity: {incident.severity_score}/10
            </div>
          </div>
        </div>

        {/* 4-Component Mathematical Decomposition */}
        <div className="space-y-2">
          <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
            NCRI Incident Component Weights
          </span>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-50 dark:bg-[#0b0f19] p-2.5 rounded-xl border border-slate-200 dark:border-slate-800/80">
              <div className="flex justify-between items-center text-[10px] text-slate-500">
                <span>SEVERITY (35%)</span>
                <span className="font-mono text-blue-600 dark:text-blue-400">{ncri.components.severity}</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 mt-1.5">
                <div
                  style={{ width: `${ncri.components.severity}%` }}
                  className="bg-blue-600 h-full rounded-full"
                />
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-[#0b0f19] p-2.5 rounded-xl border border-slate-200 dark:border-slate-800/80">
              <div className="flex justify-between items-center text-[10px] text-slate-500">
                <span>CRITICALITY (30%)</span>
                <span className="font-mono text-indigo-600 dark:text-indigo-400">{ncri.components.sectorCriticality}</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 mt-1.5">
                <div
                  style={{ width: `${ncri.components.sectorCriticality}%` }}
                  className="bg-indigo-600 h-full rounded-full"
                />
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-[#0b0f19] p-2.5 rounded-xl border border-slate-200 dark:border-slate-800/80">
              <div className="flex justify-between items-center text-[10px] text-slate-500">
                <span>EXPLOITATION (20%)</span>
                <span className="font-mono text-rose-600 dark:text-rose-400">{ncri.components.attackExploitation}</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 mt-1.5">
                <div
                  style={{ width: `${ncri.components.attackExploitation}%` }}
                  className="bg-rose-600 h-full rounded-full"
                />
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-[#0b0f19] p-2.5 rounded-xl border border-slate-200 dark:border-slate-800/80">
              <div className="flex justify-between items-center text-[10px] text-slate-500">
                <span>ACTOR IMPACT (15%)</span>
                <span className="font-mono text-amber-600 dark:text-amber-400">{ncri.components.actorImpact}</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 mt-1.5">
                <div
                  style={{ width: `${ncri.components.actorImpact}%` }}
                  className="bg-amber-600 h-full rounded-full"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Incident Details Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 dark:bg-[#0b0f19] p-3 rounded-xl border border-slate-200 dark:border-slate-800">
          <div>
            <span className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase block">Sector</span>
            <span className="font-semibold text-slate-900 dark:text-slate-100">{incident.sector}</span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase block">Date</span>
            <span className="font-semibold text-slate-900 dark:text-slate-100">{incident.incident_date}</span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase block">Attack Vector</span>
            <span className="font-semibold text-slate-900 dark:text-slate-100">{incident.attack_type}</span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase block">Threat Actor</span>
            <span className="font-semibold text-slate-900 dark:text-slate-100">{incident.threat_actor || 'Unknown / Unattributed'}</span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase block">Country</span>
            <span className="font-semibold text-slate-900 dark:text-slate-100">{incident.country || 'Global'}</span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase block">Source Feed</span>
            <span className="font-semibold text-slate-900 dark:text-slate-100">{incident.source_name || 'NCRI Verified'}</span>
          </div>
        </div>

        {/* Narrative / Description */}
        {incident.description && (
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block mb-1">
              Incident Telemetry & Narrative
            </span>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-[#0b0f19] p-3 rounded-xl border border-slate-200 dark:border-slate-800/80">
              {incident.description}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-2 flex items-center space-x-2">
          <button
            onClick={handleShare}
            className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center justify-center space-x-2 active:scale-95 transition shadow-xs"
          >
            <Share2 className="w-4 h-4" />
            <span>Share NCRI Assessment</span>
          </button>

          {incident.source_url && (
            <a
              href={incident.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
