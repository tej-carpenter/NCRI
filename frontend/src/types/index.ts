export interface SummaryKPIs {
  total_incidents: number;
  total_sources: number;
  total_vulnerabilities: number;
  total_countries: number;
  top_sector: string | null;
  top_attack_type: string | null;
  critical_severity_percentage: number;
  ransomware_percentage: number;
  latest_incident_date: string | null;
  records_with_known_actors_percentage: number;
}

export interface TrendPoint {
  period: string;
  count: number;
  moving_avg?: number;
  predicted?: boolean;
}

export interface SectorStat {
  sector: string;
  count: number;
  percentage: number;
  avg_severity: number;
  critical_count: number;
}

export interface AttackTypeStat {
  attack_type: string;
  count: number;
  percentage: number;
  avg_severity: number;
}

export interface GeoStat {
  country: string;
  country_code: string | null;
  count: number;
  percentage: number;
  top_sector?: string | null;
}

export interface SeverityStat {
  severity: string;
  count: number;
  percentage: number;
}

export interface CyberIncident {
  id: number;
  incident_ref: string;
  source_id: number;
  source_name?: string;
  title?: string;
  description?: string;
  incident_date: string;
  year?: number;
  month?: number;
  victim_name?: string;
  sector: string;
  subsector?: string;
  country?: string;
  country_code?: string;
  region?: string;
  state_province?: string;
  attack_type: string;
  attack_subtype?: string;
  threat_actor?: string;
  actor_type?: string;
  actor_country?: string;
  motive?: string;
  severity: string;
  severity_score: number;
  impact_level: string;
  records_affected?: number;
  estimated_loss_usd?: number;
  source_url?: string;
  created_at: string;
  updated_at: string;
  linked_vulnerabilities?: Array<{
    cve_id: string;
    vulnerability_name?: string;
    relationship_type: string;
    confidence: number;
  }>;
}

export interface SectorRiskItem {
  sector: string;
  incident_count: number;
  frequency_score: number;
  severity_score: number;
  criticality_score: number;
  exploitation_score: number;
  ncri_score: number;
  risk_tier: string;
}

export interface NCRIOverviewResponse {
  methodology_version: string;
  assessment_period: string;
  country_scope: string;
  overall_national_ncri: number;
  overall_risk_tier: string;
  formula_description: string;
  weightings: Record<string, number>;
  sector_scores: SectorRiskItem[];
  generated_at: string;
}

export interface DataSource {
  id: number;
  slug: string;
  name: string;
  description?: string;
  source_type: string;
  base_url?: string;
  update_frequency?: string;
  license?: string;
  is_active: boolean;
  last_sync_at?: string;
  last_sync_status: string;
  incident_count: number;
}

export interface IngestionRun {
  id: number;
  source_id: number;
  source_name?: string;
  status: string;
  started_at: string;
  completed_at?: string;
  total_processed: number;
  records_ingested: number;
  records_skipped: number;
  records_updated: number;
  error_message?: string;
}

export interface Vulnerability {
  id: number;
  cve_id: string;
  vendor_project?: string;
  product?: string;
  vulnerability_name?: string;
  date_added?: string;
  short_description?: string;
  required_action?: string;
  known_ransomware_campaign_use?: string;
  cvss_score?: number;
}
