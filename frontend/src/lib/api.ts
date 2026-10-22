import {
  SummaryKPIs,
  TrendPoint,
  SectorStat,
  AttackTypeStat,
  GeoStat,
  SeverityStat,
  CyberIncident,
  NCRIOverviewResponse,
  DataSource,
  IngestionRun,
} from '../types';

const API_BASE = '/api';

export async function fetchHealth() {
  const res = await fetch(`${API_BASE}/health`);
  return res.json();
}

export async function fetchKpis(country?: string, sector?: string): Promise<SummaryKPIs> {
  const params = new URLSearchParams();
  if (country && country !== 'All') params.append('country', country);
  if (sector && sector !== 'All') params.append('sector', sector);
  const res = await fetch(`${API_BASE}/analytics/kpis?${params.toString()}`);
  return res.json();
}

export async function fetchTrends(country?: string, sector?: string, granularity: string = 'yearly'): Promise<TrendPoint[]> {
  const params = new URLSearchParams();
  if (country && country !== 'All') params.append('country', country);
  if (sector && sector !== 'All') params.append('sector', sector);
  params.append('granularity', granularity);
  const res = await fetch(`${API_BASE}/analytics/trends?${params.toString()}`);
  return res.json();
}

export async function fetchSectors(country?: string): Promise<SectorStat[]> {
  const params = new URLSearchParams();
  if (country && country !== 'All') params.append('country', country);
  const res = await fetch(`${API_BASE}/analytics/sectors?${params.toString()}`);
  return res.json();
}

export async function fetchAttackTypes(country?: string, sector?: string): Promise<AttackTypeStat[]> {
  const params = new URLSearchParams();
  if (country && country !== 'All') params.append('country', country);
  if (sector && sector !== 'All') params.append('sector', sector);
  const res = await fetch(`${API_BASE}/analytics/attack-types?${params.toString()}`);
  return res.json();
}

export async function fetchGeography(limit: number = 20): Promise<GeoStat[]> {
  const res = await fetch(`${API_BASE}/analytics/geography?limit=${limit}`);
  return res.json();
}

export async function fetchSeverity(country?: string, sector?: string): Promise<SeverityStat[]> {
  const params = new URLSearchParams();
  if (country && country !== 'All') params.append('country', country);
  if (sector && sector !== 'All') params.append('sector', sector);
  const res = await fetch(`${API_BASE}/analytics/severity?${params.toString()}`);
  return res.json();
}

export async function fetchIncidents(params: {
  page?: number;
  size?: number;
  search?: string;
  sector?: string;
  country?: string;
  attack_type?: string;
  severity?: string;
  year?: number;
  sort_by?: string;
  sort_dir?: string;
}): Promise<{ items: CyberIncident[]; total: number; page: number; size: number; pages: number }> {
  const q = new URLSearchParams();
  if (params.page) q.append('page', params.page.toString());
  if (params.size) q.append('size', params.size.toString());
  if (params.search) q.append('search', params.search);
  if (params.sector && params.sector !== 'All') q.append('sector', params.sector);
  if (params.country && params.country !== 'All') q.append('country', params.country);
  if (params.attack_type && params.attack_type !== 'All') q.append('attack_type', params.attack_type);
  if (params.severity && params.severity !== 'All') q.append('severity', params.severity);
  if (params.year) q.append('year', params.year.toString());
  if (params.sort_by) q.append('sort_by', params.sort_by);
  if (params.sort_dir) q.append('sort_dir', params.sort_dir);

  const res = await fetch(`${API_BASE}/incidents?${q.toString()}`);
  return res.json();
}

export async function fetchIncidentDetail(id: number): Promise<CyberIncident> {
  const res = await fetch(`${API_BASE}/incidents/${id}`);
  return res.json();
}

export async function fetchRiskIndex(period: string = 'All-Time', country: string = 'All'): Promise<NCRIOverviewResponse> {
  const res = await fetch(`${API_BASE}/risk/index?period=${encodeURIComponent(period)}&country=${encodeURIComponent(country)}`);
  return res.json();
}

export async function calculateCustomRisk(payload: {
  assessment_period?: string;
  country?: string;
  weight_frequency?: number;
  weight_severity?: number;
  weight_criticality?: number;
  weight_exploitation?: number;
}): Promise<NCRIOverviewResponse> {
  const res = await fetch(`${API_BASE}/risk/calculate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function fetchRiskMethodology() {
  const res = await fetch(`${API_BASE}/risk/methodology`);
  return res.json();
}

export async function fetchSources(): Promise<DataSource[]> {
  const res = await fetch(`${API_BASE}/sources`);
  return res.json();
}

export async function triggerSourceSync(slug: string, max_records?: number) {
  const url = max_records ? `${API_BASE}/sources/${slug}/sync?max_records=${max_records}` : `${API_BASE}/sources/${slug}/sync`;
  const res = await fetch(url, { method: 'POST' });
  return res.json();
}

export async function fetchSourceRuns(slug: string): Promise<IngestionRun[]> {
  const res = await fetch(`${API_BASE}/sources/${slug}/runs`);
  return res.json();
}

export async function uploadDatasetFile(formData: FormData) {
  const res = await fetch(`${API_BASE}/sources/upload`, {
    method: 'POST',
    body: formData,
  });
  return res.json();
}

export async function fetchVulnerabilities(page: number = 1, size: number = 20, search?: string, ransomwareOnly: boolean = false) {
  const q = new URLSearchParams({ page: page.toString(), size: size.toString() });
  if (search) q.append('search', search);
  if (ransomwareOnly) q.append('ransomware_only', 'true');
  const res = await fetch(`${API_BASE}/vulnerabilities?${q.toString()}`);
  return res.json();
}

export function getCsvExportUrl(filters: {
  sector?: string;
  country?: string;
  attack_type?: string;
  severity?: string;
  year?: number;
}) {
  const q = new URLSearchParams();
  if (filters.sector && filters.sector !== 'All') q.append('sector', filters.sector);
  if (filters.country && filters.country !== 'All') q.append('country', filters.country);
  if (filters.attack_type && filters.attack_type !== 'All') q.append('attack_type', filters.attack_type);
  if (filters.severity && filters.severity !== 'All') q.append('severity', filters.severity);
  if (filters.year) q.append('year', filters.year.toString());
  return `${API_BASE}/reports/export-csv?${q.toString()}`;
}
