import { CyberIncident } from '../types';

export interface IncidentNCRIScore {
  score: number; // 0 - 100
  tier: 'Severe' | 'High' | 'Elevated' | 'Moderate' | 'Low';
  components: {
    severity: number;       // 0 - 100
    sectorCriticality: number; // 0 - 100
    attackExploitation: number; // 0 - 100
    actorImpact: number;    // 0 - 100
  };
}

export const SECTOR_CRITICALITY: Record<string, number> = {
  'Energy & Critical Utilities': 95,
  'Healthcare & Pharmaceuticals': 90,
  'Financial Services & Banking': 90,
  'Government & Defense': 85,
  'Information Technology & Telecom': 80,
  'Transportation & Logistics': 80,
  'Manufacturing & Industrial': 70,
  'Education & Research': 60,
  'Commercial & Retail': 50,
  'Other / Unclassified': 40,
};

export const ATTACK_EXPLOITATION: Record<string, number> = {
  'Ransomware & Extortion': 92,
  'Ransomware': 92,
  'Vulnerability Exploitation': 88,
  'Supply Chain Attack': 85,
  'Data Breach': 75,
  'Distributed Denial of Service (DDoS)': 65,
  'Malware': 55,
  'Unauthorized Access': 60,
  'Other': 45,
};

export function calculateIncidentNCRI(
  incident: Partial<CyberIncident>,
  weights = { severity: 0.35, criticality: 0.30, exploitation: 0.20, actor: 0.15 }
): IncidentNCRIScore {
  // 1. Severity Score (0 - 10 scale normalized to 0 - 100)
  const rawSev = incident.severity_score ?? (incident.severity === 'Critical' ? 9.5 : incident.severity === 'High' ? 7.5 : incident.severity === 'Medium' ? 5.0 : 3.0);
  const severity = Math.min(100, Math.max(10, rawSev * 10));

  // 2. Sector Criticality Score
  let sectorCrit = 50;
  if (incident.sector) {
    const matchedKey = Object.keys(SECTOR_CRITICALITY).find((k) =>
      incident.sector!.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(incident.sector!.toLowerCase())
    );
    if (matchedKey) sectorCrit = SECTOR_CRITICALITY[matchedKey];
  }

  // 3. Attack Exploitation Velocity
  let attackExp = 50;
  if (incident.attack_type) {
    const matchedKey = Object.keys(ATTACK_EXPLOITATION).find((k) =>
      incident.attack_type!.toLowerCase().includes(k.toLowerCase())
    );
    if (matchedKey) attackExp = ATTACK_EXPLOITATION[matchedKey];
  }

  // 4. Threat Actor & Consequence Impact
  let actorImpact = 50;
  if (incident.threat_actor && incident.threat_actor.trim() !== '' && incident.threat_actor.toLowerCase() !== 'unknown') {
    actorImpact = 85; // Known actor / ransomware group
  }
  if (incident.impact_level === 'Critical') actorImpact = Math.max(actorImpact, 95);
  else if (incident.impact_level === 'High') actorImpact = Math.max(actorImpact, 80);

  // Compute weighted composite NCRI
  const rawScore =
    weights.severity * severity +
    weights.criticality * sectorCrit +
    weights.exploitation * attackExp +
    weights.actor * actorImpact;

  const score = Math.round(rawScore * 10) / 10;

  let tier: 'Severe' | 'High' | 'Elevated' | 'Moderate' | 'Low' = 'Low';
  if (score >= 85.0) tier = 'Severe';
  else if (score >= 70.0) tier = 'High';
  else if (score >= 50.0) tier = 'Elevated';
  else if (score >= 25.0) tier = 'Moderate';

  return {
    score,
    tier,
    components: {
      severity,
      sectorCriticality: sectorCrit,
      attackExploitation: attackExp,
      actorImpact,
    },
  };
}
